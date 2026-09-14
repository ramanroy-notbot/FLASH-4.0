import { DelimiterType, Flashcard, DeckData, ImportInstructions } from '../types';

export const DELIMITER_MAP: Record<DelimiterType, { char: string; label: string; ankiHeader: string; ext: string; mimeType: string }> = {
  tab: {
    char: '\t',
    label: 'Tab-Separated (TSV/TXT) - Recommended for AnkiDroid',
    ankiHeader: 'Tab',
    ext: 'tsv',
    mimeType: 'text/tab-separated-values;charset=utf-8;'
  },
  comma: {
    char: ',',
    label: 'Comma-Separated (CSV)',
    ankiHeader: 'Comma',
    ext: 'csv',
    mimeType: 'text/csv;charset=utf-8;'
  },
  semicolon: {
    char: ';',
    label: 'Semicolon-Separated (;)',
    ankiHeader: 'Semicolon',
    ext: 'txt',
    mimeType: 'text/plain;charset=utf-8;'
  },
  colon: {
    char: ':',
    label: 'Colon-Separated (:)',
    ankiHeader: 'Colon',
    ext: 'txt',
    mimeType: 'text/plain;charset=utf-8;'
  }
};

/**
 * Clean and format text for Anki fields.
 * Replaces newlines with <br> if multi-line so it won't break single-line card records.
 */
export function formatFieldForAnki(text: string, delimiter: DelimiterType): string {
  if (!text) return '';
  
  // Replace newlines with HTML break tags for Anki compatibility
  let cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br>');

  const delimiterChar = DELIMITER_MAP[delimiter].char;

  // If the delimiter is comma, escape double quotes and wrap in quotes if needed
  if (delimiter === 'comma') {
    const needsQuotes = cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n');
    cleaned = cleaned.replace(/"/g, '""');
    if (needsQuotes) {
      cleaned = `"${cleaned}"`;
    }
  } else if (delimiter === 'semicolon') {
    const needsQuotes = cleaned.includes(';') || cleaned.includes('"');
    cleaned = cleaned.replace(/"/g, '""');
    if (needsQuotes) {
      cleaned = `"${cleaned}"`;
    }
  } else if (delimiter === 'colon') {
    const needsQuotes = cleaned.includes(':') || cleaned.includes('"');
    cleaned = cleaned.replace(/"/g, '""');
    if (needsQuotes) {
      cleaned = `"${cleaned}"`;
    }
  } else if (delimiter === 'tab') {
    // If tab separated, remove literal tabs or replace with spaces
    cleaned = cleaned.replace(/\t/g, ' ');
  }

  return cleaned;
}

/**
 * Generate formatted Anki import text string
 */
export function generateAnkiExportText(
  cards: Flashcard[],
  delimiter: DelimiterType,
  options: {
    includeHeaders?: boolean;
    includeTags?: boolean;
    noteType?: 'Basic' | 'Cloze';
    deckName?: string;
  } = {}
): string {
  const {
    includeHeaders = true,
    includeTags = true,
    noteType = 'Basic',
    deckName
  } = options;

  const delimConfig = DELIMITER_MAP[delimiter];
  const sep = delimConfig.char;

  const lines: string[] = [];

  // Anki Special Directives
  if (includeHeaders) {
    lines.push(`#separator:${delimConfig.ankiHeader}`);
    lines.push('#html:true');
    lines.push(`#notetype:${noteType}`);
    if (includeTags) {
      lines.push('#tags column:3');
    }
    if (deckName) {
      lines.push(`#deck:${deckName.trim()}`);
    }
  }

  // Cards
  for (const card of cards) {
    const front = formatFieldForAnki(card.front, delimiter);
    const back = formatFieldForAnki(card.back, delimiter);
    const tags = includeTags && card.tags && card.tags.length > 0 
      ? card.tags.map(t => t.trim().replace(/\s+/g, '_')).join(' ') 
      : '';

    if (includeTags && tags) {
      lines.push(`${front}${sep}${back}${sep}${tags}`);
    } else {
      lines.push(`${front}${sep}${back}`);
    }
  }

  return lines.join('\n');
}

/**
 * Download file to device
 */
export function downloadAnkiFile(
  content: string,
  filename: string,
  delimiter: DelimiterType
): void {
  const delimConfig = DELIMITER_MAP[delimiter];
  const blob = new Blob([content], { type: delimConfig.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share file using Web Share API on mobile (Android)
 */
export async function shareToAnkiDroid(
  content: string,
  filename: string,
  delimiter: DelimiterType
): Promise<{ success: boolean; message: string }> {
  const delimConfig = DELIMITER_MAP[delimiter];
  const blob = new Blob([content], { type: delimConfig.mimeType });
  const file = new File([blob], filename, { type: delimConfig.mimeType });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Import these flashcards into AnkiDroid'
      });
      return { success: true, message: 'Shared successfully! Select AnkiDroid to import.' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, message: 'Share cancelled' };
      }
      return { success: false, message: `Share failed: ${err.message}` };
    }
  } else {
    // Fallback: trigger standard download
    downloadAnkiFile(content, filename, delimiter);
    return { 
      success: true, 
      message: 'File downloaded. Open your Android file manager or Downloads to tap and import into AnkiDroid.' 
    };
  }
}

/**
 * Generate tailored step-by-step import instructions for AnkiDroid
 */
export function getAnkiDroidInstructions(
  delimiter: DelimiterType,
  noteType: 'Basic' | 'Cloze',
  hasHeaders: boolean,
  deckName: string = 'Default'
): ImportInstructions {
  const delimConfig = DELIMITER_MAP[delimiter];

  const steps = [
    {
      stepNumber: 1,
      title: 'Download or Share the File',
      description: `Save the generated .${delimConfig.ext} file to your Android device (usually in your 'Downloads' folder), or tap the 'Share to AnkiDroid' button.`,
      tip: 'The file already includes Anki #directives so AnkiDroid can auto-configure the delimiter!'
    },
    {
      stepNumber: 2,
      title: 'Open AnkiDroid & Access Import',
      description: 'Open the AnkiDroid app on your phone. In the top-right corner, tap the 3 vertical dots (⋮) menu, then tap "Import".',
      tip: 'On some Android versions, you can also just tap the downloaded file directly from your notification tray or file manager and select "Open with AnkiDroid".'
    },
    {
      stepNumber: 3,
      title: 'Select the File from Storage',
      description: `In the file picker, browse to your Downloads folder and pick the file you downloaded: "${deckName.replace(/\s+/g, '_')}.${delimConfig.ext}".`,
      tip: 'Make sure AnkiDroid has storage/file permissions enabled in Android Settings.'
    },
    {
      stepNumber: 4,
      title: 'Verify Import Mapping Settings',
      description: `AnkiDroid will show the import preview. Verify:
• Separator: "${delimConfig.ankiHeader}"
• Note Type: "${noteType}" (Critical: ${noteType === 'Cloze' ? 'Cloze must be selected for {{c1::...}} deletion cards!' : 'Basic (front/back)'})
• Allow HTML: Checked (YES)
• Target Deck: Choose "${deckName}" or select an existing deck.`,
      tip: hasHeaders 
        ? 'Because #separator and #notetype headers are included in your file, AnkiDroid configures these fields automatically!'
        : `If you turned off headers, manually select ${delimConfig.ankiHeader} as the Field Separator.`
    },
    {
      stepNumber: 5,
      title: 'Confirm & Review Cards',
      description: 'Tap "Import" in the top or bottom right. You will see a confirmation message (e.g. "X cards imported, 0 skipped"). Your new deck is ready for spaced repetition review!',
      tip: 'Tap on the newly created deck in AnkiDroid to immediately start studying with flip-card recall.'
    }
  ];

  const troubleshooting = [
    {
      issue: 'Cards imported with both Question and Answer crammed into Field 1',
      solution: `The separator setting was incorrect. In AnkiDroid's import screen, explicitly tap 'Field Separator' and choose '${delimConfig.ankiHeader}'. Also ensure the file includes the '#separator:${delimConfig.ankiHeader}' header line at the top.`
    },
    {
      issue: 'Cloze cards show literal {{c1::text}} instead of blank brackets [...]',
      solution: 'When importing, AnkiDroid requires the Note Type to be set to "Cloze". If it was imported as "Basic", Anki treats the cloze syntax as plain text. Re-import the file and select Note Type -> Cloze.'
    },
    {
      issue: 'Cannot find the downloaded file in AnkiDroid file picker',
      solution: 'Check your Android "Downloads" folder. Alternatively, open your device\'s "Files" or "My Files" app, find the file, tap "Share", and select "AnkiDroid".'
    },
    {
      issue: 'HTML code like <br> is showing literally',
      solution: 'In AnkiDroid\'s import settings screen, make sure the checkbox "Allow HTML in fields" is turned ON.'
    }
  ];

  return {
    platform: 'ankidroid',
    delimiter,
    delimiterChar: delimConfig.char,
    noteType,
    hasAnkiHeaders: hasHeaders,
    steps,
    troubleshooting
  };
}
