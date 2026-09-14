import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// High body limits for image and PDF base64 payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Primary Analysis & Flashcard Generation Endpoint
app.post('/api/analyze-and-generate', async (req, res) => {
  try {
    const {
      fileData, // base64 string
      mimeType, // e.g. image/jpeg, image/png, application/pdf
      fileName,
      textContent,
      cardFormat = 'mixed', // 'mixed' | 'basic' | 'cloze' | 'reversible' | 'definition'
      delimiter = 'tab', // 'tab' | 'comma' | 'semicolon' | 'colon'
      targetCount = 10,
      deckName,
      customInstructions = '',
      subject = 'General Medicine',
    } = req.body;

    if (!fileData && (!textContent || !textContent.trim())) {
      return res.status(400).json({
        error: 'Please provide either a photo/PDF document or text content to analyze.',
      });
    }

    const ai = getGeminiClient();

    // Prepare system instructions and prompts
    const promptParts: any[] = [];

    // Multimodal image / PDF support
    if (fileData) {
      // Strip data url prefix if present (e.g. data:image/jpeg;base64,...)
      const cleanBase64 = fileData.includes(';base64,')
        ? fileData.split(';base64,')[1]
        : fileData;

      promptParts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const formatInstructions = `
Target MBBS Specialty / Subject: ${subject}
Target card format: ${cardFormat.toUpperCase()}
- If BASIC: 'front' is an active recall question or prompt, 'back' is the concise, definitive answer.
- If CLOZE: 'front' MUST contain Anki standard cloze brackets like {{c1::key concept}} or {{c1::term::hint}}. You can include multiple clozes {{c2::other part}} where appropriate. 'back' is extra context, mnemonic, or explanation for why the answer is correct.
- If REVERSIBLE: 'front' is term / question, 'back' is definition / answer suitable for two-way recall.
- If DEFINITION: 'front' is "Define: [Term]", 'back' is the complete clear definition and example.
- If MIXED: Use CLOZE for sentences with critical vocabulary or dates, and BASIC for cause-and-effect or conceptual explanations.

Target number of cards: approx ${targetCount} high-yield cards.
User Deck Name: ${deckName || `MBBS ${subject} High-Yield`}
Additional user directives: ${customInstructions || 'Focus on core concepts, definitions, formulas, and high-yield exam facts.'}
`;

    const textPrompt = `
You are an elite educational specialist and flashcard architect specifically designing study decks for AnkiDroid on Android.
Analyze the provided visual document (handwritten notes, whiteboard diagram, textbook scan, PDF, or text notes).
Carefully transcribe any handwritten words, formulas, equations, definitions, bullet points, or dates.

Create spaced-repetition flashcards adhering strictly to the "Minimum Information Principle" (one atomic fact per card, never multi-paragraph answers).
For AnkiDroid compatibility:
1. Every card must have a clear, crisp 'front' and informative 'back'.
2. Use valid Anki cloze syntax {{c1::hidden answer}} when cloze format is requested.
3. Assign 2-4 clean, single-word or underscore_separated lowercase tags (e.g. "biology", "exam_review", "ch3").
4. Return a structured JSON object matching the requested schema.

${formatInstructions}
${textContent ? `Text input provided by user:\n"""\n${textContent}\n"""` : ''}
`;

    promptParts.push({ text: textPrompt });

    // Call Gemini with retry and intelligent model fallback for resilience against 503 spikes
    // gemini-3.1-flash-lite provides fast, reliable extraction and independent capacity during 3.8-flash demand spikes
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];
    let response: any = null;
    let lastError: any = null;

    const requestConfig = {
      systemInstruction:
        'You are a specialized Anki & AnkiDroid flashcard generator. You analyze photos of handwritten notes, PDFs, diagrams, and study materials, converting them into optimized spaced-repetition flashcards. Always respond with clean, valid JSON matching the schema.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Appropriate title for this Anki deck',
          },
          description: {
            type: Type.STRING,
            description: 'Brief overview of the material covered in this deck',
          },
          extractedTextSummary: {
            type: Type.STRING,
            description:
              'Summary of the raw text and handwriting extracted from the input',
          },
          detectedTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key subject tags or topics identified',
          },
          recommendedNoteType: {
            type: Type.STRING,
            description: 'Either "Basic" or "Cloze"',
          },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: {
                  type: Type.STRING,
                  description:
                    'Front of card or Cloze sentence with {{c1::...}}',
                },
                back: {
                  type: Type.STRING,
                  description: 'Back of card or Cloze explanation/extra',
                },
                type: {
                  type: Type.STRING,
                  description:
                    'Type of card: "basic", "cloze", "reversible", or "definition"',
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Tags for Anki organization',
                },
                notes: {
                  type: Type.STRING,
                  description: 'Optional additional study note or hint',
                },
              },
              required: ['front', 'back', 'type', 'tags'],
            },
          },
        },
        required: [
          'title',
          'description',
          'detectedTopics',
          'recommendedNoteType',
          'cards',
        ],
      },
    };

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: promptParts,
            config: requestConfig,
          });
          if (response?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          console.warn(`Model ${model} attempt ${attempt} error:`, errMsg);

          // If the model is experiencing high demand (503) or rate limit quota (429),
          // immediately fail over to the next candidate model instead of wasting time
          const isHighDemandOrQuota =
            err?.status === 503 ||
            err?.status === 429 ||
            errMsg.includes('503') ||
            errMsg.includes('429') ||
            errMsg.includes('high demand') ||
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            errMsg.includes('UNAVAILABLE');

          if (isHighDemandOrQuota) {
            break; // Switch to next candidate model immediately
          }

          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }
      if (response?.text) {
        break;
      }
    }

    if (!response?.text) {
      const rawMsg = lastError?.message || String(lastError || '');
      let cleanErrorMessage =
        'Failed to generate flashcards from the study material. Please try again.';

      if (rawMsg.includes('high demand') || rawMsg.includes('503')) {
        cleanErrorMessage =
          'The AI model service is currently experiencing high demand. Please retry in a few moments.';
      } else if (rawMsg.includes('quota') || rawMsg.includes('429')) {
        cleanErrorMessage =
          'Rate limit reached for the free tier. Please wait a few seconds and try again.';
      } else if (rawMsg.length > 0 && !rawMsg.startsWith('{')) {
        cleanErrorMessage = rawMsg;
      }

      throw new Error(cleanErrorMessage);
    }

    let rawText = (response.text || '').trim();
    if (rawText.startsWith('```')) {
      rawText = rawText
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
    }
    const parsedData = JSON.parse(rawText || '{}');

    // Format cards with unique IDs
    const cardsWithIds = (parsedData.cards || []).map(
      (card: any, index: number) => ({
        id: `card-${Date.now()}-${index}`,
        front: card.front || '',
        back: card.back || '',
        type: card.type || (card.front?.includes('{{c') ? 'cloze' : 'basic'),
        tags: Array.isArray(card.tags) ? card.tags : ['study'],
        notes: card.notes || '',
      })
    );

    const resultDeck = {
      id: `deck-${Date.now()}`,
      title: deckName || parsedData.title || 'AnkiDroid Study Deck',
      description: parsedData.description || 'Generated flashcard deck',
      extractedTextSummary: parsedData.extractedTextSummary || '',
      detectedTopics: parsedData.detectedTopics || [],
      recommendedNoteType:
        cardFormat === 'cloze'
          ? 'Cloze'
          : parsedData.recommendedNoteType || 'Basic',
      recommendedDelimiter: delimiter,
      cards: cardsWithIds,
      sourceType: fileData ? (mimeType?.includes('pdf') ? 'pdf' : 'image') : 'text',
      sourceName: fileName || (fileData ? 'Uploaded Document' : 'Pasted Notes'),
      createdAt: new Date().toISOString(),
      subject: subject || 'General Medicine',
    };

    res.json({
      success: true,
      deck: resultDeck,
    });
  } catch (error: any) {
    console.error('Error analyzing content for flashcards:', error);
    res.status(500).json({
      success: false,
      error:
        error.message ||
        'Failed to process file and generate flashcards. Please check your file format and retry.',
    });
  }
});

// Start the Express and Vite dev server / static handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
