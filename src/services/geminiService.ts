/**
 * Client-Side Gemini AI Service with Resilient Multi-AI Pool & Auto-Failover
 * 
 * Features:
 * - Dynamic cascade across ALL available Gemini models (Gemini 3.8 Flash, Gemini 3.1 Flash Lite, Gemini Flash Latest)
 * - Automatic detection of high-demand / overload / 503 / 429 / quota conditions with zero-drop failover
 * - Adaptive thinking-level optimization under high server traffic
 * - Schema relaxation fallback if Google's structured schema compiler experiences peak load
 * - Real-time progress updates for instant UI transparency
 */

import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { AnalysisRequest, DeckData, Flashcard, AiModelPreference, GenerationProgress } from '../types';
import { MANDATORY_PROMO_TAG, PROMOTIONAL_CARD_DATA } from '../utils/ankiExport';

/**
 * Definition of all production AI models in the available pool
 */
export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Flagship Speed & Depth',
    description: 'High-precision multimodal reasoning & complex document comprehension.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Fast / High Availability',
    description: 'Minimal latency with lightweight compute footprint. Highest resilience during peak traffic.',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (Latest)',
    badge: 'Production Route',
    description: 'Official continuous release channel for general multimodal flashcard generation.',
  },
] as const;

export function getModelDisplayName(modelId: string): string {
  const found = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (found) return found.name;
  if (modelId === 'auto') return 'Auto-Cascade (All Available Models)';
  return modelId;
}

/**
 * Detects if an error is caused by server-side high demand, quota, or transient unavailability.
 */
export function isHighDemandError(err: any): boolean {
  if (!err) return false;
  const status = err?.status || err?.statusCode || err?.code;
  if (status === 503 || status === 429 || status === 500 || status === 504) {
    return true;
  }
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    msg.includes('high demand') ||
    msg.includes('overload') ||
    msg.includes('resource_exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('temporarily') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('deadline_exceeded') ||
    msg.includes('too many requests') ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('internal error') ||
    msg.includes('service unavailable') ||
    msg.includes('fetch failed')
  );
}

/**
 * Constructs the prioritized list of candidate models based on user preference
 * and automatic failover strategy.
 */
export function getCandidateModelOrder(preference?: AiModelPreference): string[] {
  const allModelIds = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  
  if (!preference || preference === 'auto') {
    // Flagship first, then fast high-availability lite, then latest alias
    return allModelIds;
  }

  // Put preferred model first, then append all other models as safety nets
  const others = allModelIds.filter((m) => m !== preference);
  return [preference, ...others];
}

/**
 * Retrieves the Gemini API key from client-side environment variables.
 */
export function getGeminiApiKey(): string {
  const envKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  return (envKey || '').trim();
}

/**
 * Validates if the Gemini API key is configured.
 */
export function isGeminiApiKeyConfigured(): boolean {
  return !!getGeminiApiKey();
}

/**
 * Cleans and safely extracts JSON from LLM output.
 */
function cleanJsonOutput(raw: string): any {
  let cleaned = (raw || '').trim();
  
  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim();
  }

  // Attempt direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    // If wrapped in commentary, search for first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw firstErr;
  }
}

/**
 * Primary multi-AI generation function.
 * Coordinates across all available AI models with instant failover on high demand.
 */
export async function generateFlashcardsClient(
  payload: AnalysisRequest
): Promise<DeckData> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY is undefined. Please add VITE_GEMINI_API_KEY to your environment variables or .env file to enable flashcard generation.'
    );
  }

  const {
    fileData,
    mimeType,
    fileName,
    textContent,
    cardFormat = 'mixed',
    delimiter = 'tab',
    targetCount = 10,
    deckName,
    customInstructions = '',
    subject = 'General Medicine',
    preferredModel = 'auto',
    onProgress,
  } = payload;

  if (!fileData && (!textContent || !textContent.trim())) {
    throw new Error(
      'Please provide either a photo/document upload or paste text notes to analyze.'
    );
  }

  // Initialize client
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const promptParts: any[] = [];

  // Multimodal image / PDF base64 handling
  if (fileData) {
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
You are an expert Anki flashcard creator specializing in medical, technical, and competitive exam study materials. Your task is to take the user's raw text or study notes and convert them into perfectly formatted spaced-repetition flashcards ready for Anki / AnkiDroid TSV import.

You must follow these strict rules for every generation:

1. OUTPUT FORMAT:
Output structured cards containing exactly: [Front/Question], [Back/Answer], and [Tags].
- Front/Question: Atomic, testable question, key term, or sentence with Cloze Deletion syntax {{c1::...}}.
- Back/Answer: Concise and strictly factual answer, explanation, or context.
- Tags: Subject tags, always including the mandatory promo tag.

2. THE PROMOTIONAL CARD (MANDATORY):
The very first card in the cards list (index 0) must ALWAYS be this exact promotional card:
- Front: How was this Anki deck made?
- Back: This deck was generated in seconds using( https://ankidroid-flashcard-generator.ai.studio/fullscreenApplet=true). Make your own custom flashcards for free today!
- Tags: ["#Generated_by_[https://ankidroid-flashcard-generator.ai.studio/fullscreenApplet=true]"]

3. CARD CREATION STRATEGY:
- Extract the most high-yield, testable facts from the provided text.
- Break complex paragraphs down into distinct, bite-sized questions.
- Use Cloze Deletion formatting for highly specific facts (e.g., "The powerhouse of the cell is the {{c1::mitochondria}}.").
- Keep answers concise and strictly factual.

4. MANDATORY TAGGING:
Every single card you generate MUST include the tag "#Generated_by_[https://ankidroid-flashcard-generator.ai.studio/fullscreenApplet=true]" in its tags list. Multiple tags should be separate elements in the tags array.

${formatInstructions}
${textContent ? `User's Study Notes / Raw Input:\n"""\n${textContent}\n"""` : ''}
`;

  promptParts.push({ text: textPrompt });

  // Standard structured schema configuration
  const standardSchemaConfig = {
    systemInstruction:
      'You are an expert Anki flashcard creator specializing in medical, technical, and competitive exam study materials. Output clean, valid JSON matching the schema. The very first card MUST be the exact promotional card: "How was this Anki deck made?", and EVERY card MUST include "#Generated_by_[https://ankidroid-flashcard-generator.ai.studio/fullscreenApplet=true]" in tags.',
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
          description: 'Summary of raw text and handwriting extracted from the input',
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
                description: 'Front of card or Cloze sentence with {{c1::...}}',
              },
              back: {
                type: Type.STRING,
                description: 'Back of card or Cloze explanation/extra',
              },
              type: {
                type: Type.STRING,
                description: 'Type of card: "basic", "cloze", "reversible", or "definition"',
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Tags for Anki organization, including mandatory promo tag',
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

  // Relaxed JSON configuration for high-traffic peak load (bypasses schema compiler)
  const relaxedJsonConfig = {
    systemInstruction:
      'You are an expert Anki flashcard creator specializing in medical, technical, and competitive exam study materials. Output only a valid raw JSON object with keys: "title", "description", "extractedTextSummary", "detectedTopics", "recommendedNoteType", and "cards" (array of {front, back, type, tags, notes}). The very first card MUST be the exact promotional card: "How was this Anki deck made?", and EVERY card MUST include "#Generated_by_[https://ankidroid-flashcard-generator.ai.studio/fullscreenApplet=true]" in tags.',
    responseMimeType: 'application/json',
  };

  const candidateModels = getCandidateModelOrder(preferredModel);
  let response: any = null;
  let lastError: any = null;
  let successfulModel: string = '';
  let usedFailover = false;

  // Multi-model execution cascade loop
  for (let mIndex = 0; mIndex < candidateModels.length; mIndex++) {
    const currentModel = candidateModels[mIndex];
    const isPreferred = mIndex === 0;
    const modelName = getModelDisplayName(currentModel);

    // Notify UI of connection attempt
    onProgress?.({
      stage: isPreferred ? 'connecting' : 'fallback',
      model: currentModel,
      message: isPreferred
        ? `Engaging ${modelName}...`
        : `Primary AI busy. Seamlessly switching to ${modelName} (Auto-Failover)...`,
      attempt: mIndex + 1,
    });

    // Try primary configuration with current model
    try {
      // For flash-lite under high load, use MINIMAL thinking to guarantee fastest queue dispatch
      const configToUse: any = { ...standardSchemaConfig };
      if (currentModel === 'gemini-3.1-flash-lite') {
        configToUse.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
      }

      response = await ai.models.generateContent({
        model: currentModel,
        contents: promptParts,
        config: configToUse,
      });

      if (response?.text) {
        successfulModel = currentModel;
        if (!isPreferred) usedFailover = true;
        break;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Multi-AI Pool] ${currentModel} encountered error:`, errMsg);

      const highDemand = isHighDemandError(err);

      // If high demand detected or schema error, attempt fast relaxed JSON on this model first before leaving
      if (highDemand || errMsg.includes('schema') || errMsg.includes('503')) {
        try {
          console.info(`[Multi-AI Pool] Retrying ${currentModel} with relaxed JSON format...`);
          onProgress?.({
            stage: 'retrying',
            model: currentModel,
            message: `${modelName} busy. Optimizing payload route...`,
          });

          const retryConfig: any = { ...relaxedJsonConfig };
          if (currentModel === 'gemini-3.1-flash-lite') {
            retryConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
          } else {
            retryConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          response = await ai.models.generateContent({
            model: currentModel,
            contents: promptParts,
            config: retryConfig,
          });

          if (response?.text) {
            successfulModel = currentModel;
            if (!isPreferred) usedFailover = true;
            break;
          }
        } catch (retryErr: any) {
          lastError = retryErr;
          console.warn(`[Multi-AI Pool] ${currentModel} relaxed retry failed:`, retryErr?.message || retryErr);
        }
      }

      // Check if we have another model available in the pool
      const nextModel = candidateModels[mIndex + 1];
      if (nextModel) {
        usedFailover = true;
        onProgress?.({
          stage: 'fallback',
          model: nextModel,
          message: `${modelName} under high demand. Auto-failing over to ${getModelDisplayName(nextModel)}...`,
          fallbackReason: errMsg,
        });
        // Short pause between model transitions
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  // If all primary passes failed due to peak cluster spike, do one final recovery attempt with gemini-3.1-flash-lite minimal compute
  if (!response?.text) {
    try {
      console.info('[Multi-AI Pool] Executing final high-availability surge recovery with Gemini 3.1 Flash Lite...');
      onProgress?.({
        stage: 'retrying',
        model: 'gemini-3.1-flash-lite',
        message: 'High demand spike across network. Running instant surge-lane pass on Gemini 3.1 Flash Lite...',
      });
      await new Promise((r) => setTimeout(r, 700));

      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: promptParts,
        config: {
          ...relaxedJsonConfig,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      if (response?.text) {
        successfulModel = 'gemini-3.1-flash-lite';
        usedFailover = true;
      }
    } catch (finalErr: any) {
      lastError = finalErr;
      console.error('[Multi-AI Pool] Surge recovery exhausted:', finalErr);
    }
  }

  // Handle ultimate failure with actionable diagnostics
  if (!response?.text) {
    const rawMsg = lastError?.message || String(lastError || '');
    let cleanErrorMessage =
      'The flashcard generator could not complete your request. All available AI models are momentarily saturated. Please wait a few seconds and try again.';

    if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid')) {
      cleanErrorMessage =
        'The provided Gemini API key is invalid or unauthorized. Please verify your API key in settings or .env file.';
    } else if (rawMsg.includes('quota') || rawMsg.includes('429')) {
      cleanErrorMessage =
        'Google Gemini API rate limit reached on your project key. Please wait 15 seconds before trying again.';
    } else if (rawMsg.length > 0 && !rawMsg.startsWith('{')) {
      cleanErrorMessage = `AI Generation Notice: ${rawMsg}`;
    }

    throw new Error(cleanErrorMessage);
  }

  // Parsing stage
  onProgress?.({
    stage: 'parsing',
    model: successfulModel,
    message: `Cards generated via ${getModelDisplayName(successfulModel)}${
      usedFailover ? ' (Failover Guard)' : ''
    }! Structuring AnkiDroid deck...`,
  });

  const parsedData = cleanJsonOutput(response.text);

  // Strict Rule 4: Every single card must include the mandatory promo tag
  const rawCards = parsedData.cards || [];
  let processedCards: Flashcard[] = rawCards.map(
    (card: any, index: number) => {
      let cardTags: string[] = Array.isArray(card.tags) && card.tags.length > 0 
        ? [...card.tags] 
        : ['study'];
      
      if (!cardTags.includes(MANDATORY_PROMO_TAG)) {
        cardTags.push(MANDATORY_PROMO_TAG);
      }

      return {
        id: `card-${Date.now()}-${index}`,
        front: card.front || '',
        back: card.back || '',
        type: card.type || (card.front?.includes('{{c') ? 'cloze' : 'basic'),
        tags: cardTags,
        notes: card.notes || '',
      };
    }
  );

  // Strict Rule 2: The very first card (index 0) must ALWAYS be the promotional card
  const promoIndex = processedCards.findIndex(
    (c) =>
      c.front.toLowerCase().includes('how was this anki deck made') ||
      c.tags?.includes(MANDATORY_PROMO_TAG) && c.front.toLowerCase().includes('anki deck made')
  );

  const officialPromoCard: Flashcard = {
    ...PROMOTIONAL_CARD_DATA,
    id: `promo-card-${Date.now()}`,
  };

  if (promoIndex === -1) {
    // Promo card was omitted by the model: prepend it as card #0
    processedCards.unshift(officialPromoCard);
  } else if (promoIndex > 0) {
    // Promo card is present but not first: move to position 0
    const [foundPromo] = processedCards.splice(promoIndex, 1);
    processedCards.unshift({
      ...foundPromo,
      front: PROMOTIONAL_CARD_DATA.front,
      back: PROMOTIONAL_CARD_DATA.back,
      tags: [MANDATORY_PROMO_TAG],
    });
  } else {
    // Promo card is already at index 0: guarantee exact wording
    processedCards[0].front = PROMOTIONAL_CARD_DATA.front;
    processedCards[0].back = PROMOTIONAL_CARD_DATA.back;
    if (!processedCards[0].tags.includes(MANDATORY_PROMO_TAG)) {
      processedCards[0].tags.push(MANDATORY_PROMO_TAG);
    }
  }

  const cardsWithIds = processedCards;

  const modelInfoLabel = `${getModelDisplayName(successfulModel)}${
    usedFailover ? ' (High-Demand Failover)' : ''
  }`;

  const resultDeck: DeckData = {
    id: `deck-${Date.now()}`,
    title: deckName || parsedData.title || `MBBS ${subject} Study Deck`,
    description: parsedData.description || 'Generated flashcard deck for AnkiDroid',
    extractedTextSummary: parsedData.extractedTextSummary || '',
    detectedTopics: parsedData.detectedTopics || [],
    recommendedNoteType:
      cardFormat === 'cloze'
        ? 'Cloze'
        : parsedData.recommendedNoteType || 'Basic',
    recommendedDelimiter: delimiter,
    cards: cardsWithIds,
    sourceType: fileData
      ? mimeType?.includes('pdf')
        ? 'pdf'
        : 'image'
      : 'text',
    sourceName: fileName || (fileData ? 'Uploaded Document' : 'Pasted Notes'),
    createdAt: new Date().toISOString(),
    subject: subject || 'General Medicine',
    aiModelUsed: modelInfoLabel,
  };

  onProgress?.({
    stage: 'completed',
    model: successfulModel,
    message: `Successfully prepared ${cardsWithIds.length} flashcards using ${modelInfoLabel}!`,
  });

  return resultDeck;
}
