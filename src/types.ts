export type CardType = 'basic' | 'cloze' | 'reversible' | 'definition';

export type DelimiterType = 'tab' | 'comma' | 'semicolon' | 'colon';

export type MbbsSubject =
  | 'Anatomy'
  | 'Physiology'
  | 'Biochemistry'
  | 'Pathology'
  | 'Pharmacology'
  | 'Microbiology'
  | 'Forensic Medicine (FMT)'
  | 'Community Medicine (PSM)'
  | 'Ophthalmology'
  | 'ENT'
  | 'General Medicine'
  | 'General Surgery'
  | 'OBGYN'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Dermatology'
  | 'Psychiatry'
  | 'Radiology'
  | 'Anesthesiology';

export interface Flashcard {
  id: string;
  front: string; // For cloze, front contains the text with {{c1::...}}
  back: string;  // For cloze, extra context or explanation
  type: CardType;
  tags: string[];
  notes?: string;
  sourceSnippet?: string;
}

export interface DeckData {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  recommendedDelimiter: DelimiterType;
  recommendedNoteType: 'Basic' | 'Cloze';
  detectedTopics: string[];
  extractedTextSummary?: string;
  sourceType: 'image' | 'pdf' | 'text' | 'sample';
  sourceName?: string;
  createdAt: string;
  updatedAt?: string;
  subject?: MbbsSubject;
}

export interface AnalysisRequest {
  fileData?: string; // base64
  mimeType?: string;
  fileName?: string;
  textContent?: string;
  cardFormat: CardType | 'mixed';
  delimiter: DelimiterType;
  targetCount: number;
  deckName?: string;
  customInstructions?: string;
  subject?: MbbsSubject;
}

export interface ImportInstructions {
  platform: 'ankidroid' | 'anki_desktop';
  delimiter: DelimiterType;
  delimiterChar: string;
  noteType: 'Basic' | 'Cloze';
  hasAnkiHeaders: boolean;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    tip?: string;
  }[];
  troubleshooting: {
    issue: string;
    solution: string;
  }[];
}
