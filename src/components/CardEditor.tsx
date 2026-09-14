import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  FileCode, 
  HelpCircle, 
  BookOpen, 
  Plus, 
  Trash2, 
  Tag, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Info,
  GraduationCap,
  Save,
  Check
} from 'lucide-react';
import { Flashcard, DeckData, DelimiterType, MbbsSubject } from '../types';
import { DELIMITER_MAP, downloadAnkiFile, shareToAnkiDroid, generateAnkiExportText } from '../utils/ankiExport';
import { MBBS_SUBJECTS, getMbbsSubjectInfo } from '../utils/mbbsSubjects';

interface CardEditorProps {
  deck: DeckData;
  onUpdateDeck: (updated: DeckData) => void;
  onOpenGuide: () => void;
  onOpenRawExport: () => void;
  onOpenSimulator: () => void;
  onOpenShareModal: () => void;
  onSaveToLibrary?: () => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  deck,
  onUpdateDeck,
  onOpenGuide,
  onOpenRawExport,
  onOpenSimulator,
  onOpenShareModal,
  onSaveToLibrary
}) => {
  const [activeDelimiter, setActiveDelimiter] = useState<DelimiterType>(deck.recommendedDelimiter || 'tab');
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [savedBadge, setSavedBadge] = useState(false);

  const delimConfig = DELIMITER_MAP[activeDelimiter];
  const filename = `${(deck.title || 'AnkiDroid_Deck').replace(/[^a-zA-Z0-9_-]/g, '_')}.${delimConfig.ext}`;
  const subjectInfo = getMbbsSubjectInfo(deck.subject);

  const handleSaveClick = () => {
    if (onSaveToLibrary) {
      onSaveToLibrary();
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    }
  };

  // Card updates
  const handleUpdateCard = (id: string, updates: Partial<Flashcard>) => {
    const updatedCards = deck.cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onUpdateDeck({ ...deck, cards: updatedCards });
  };

  const handleDeleteCard = (id: string) => {
    const updatedCards = deck.cards.filter((c) => c.id !== id);
    onUpdateDeck({ ...deck, cards: updatedCards });
  };

  const handleAddCard = () => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: '',
      back: '',
      type: deck.recommendedNoteType === 'Cloze' ? 'cloze' : 'basic',
      tags: deck.detectedTopics.length > 0 ? [deck.detectedTopics[0].toLowerCase().replace(/\s+/g, '_')] : ['anki']
    };
    onUpdateDeck({ ...deck, cards: [newCard, ...deck.cards] });
  };

  // Insert Cloze Deletion syntax around selected text
  const handleInsertCloze = (cardId: string, currentFront: string) => {
    const textarea = document.getElementById(`front-textarea-${cardId}`) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentFront.substring(start, end);

    // Count existing clozes to determine next index
    const existingClozes = (currentFront.match(/\{\{c(\d+)::/g) || []).length;
    const nextIndex = existingClozes + 1;

    let newFront = '';
    if (selected && selected.trim()) {
      newFront =
        currentFront.substring(0, start) +
        `{{c${nextIndex}::${selected}}}` +
        currentFront.substring(end);
    } else {
      newFront =
        currentFront.substring(0, start) +
        `{{c${nextIndex}::key term}}` +
        currentFront.substring(end);
    }

    handleUpdateCard(cardId, { front: newFront, type: 'cloze' });
  };

  const handleDownload = () => {
    const exportText = generateAnkiExportText(deck.cards, activeDelimiter, {
      includeHeaders: true,
      includeTags: true,
      noteType: deck.cards.some((c) => c.type === 'cloze') ? 'Cloze' : 'Basic',
      deckName: deck.title
    });
    downloadAnkiFile(exportText, filename, activeDelimiter);
  };

  const handleShare = async () => {
    const exportText = generateAnkiExportText(deck.cards, activeDelimiter, {
      includeHeaders: true,
      includeTags: true,
      noteType: deck.cards.some((c) => c.type === 'cloze') ? 'Cloze' : 'Basic',
      deckName: deck.title
    });
    setShareStatus('Opening AnkiDroid share intent...');
    const res = await shareToAnkiDroid(exportText, filename, activeDelimiter);
    setShareStatus(res.message);
    setTimeout(() => setShareStatus(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Deck Header & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* MBBS Subject Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MBBS Subject:</span>
                <select
                  value={deck.subject || 'General Medicine'}
                  onChange={(e) => onUpdateDeck({ ...deck, subject: e.target.value as MbbsSubject })}
                  className="text-xs bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {MBBS_SUBJECTS.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.phase})
                    </option>
                  ))}
                </select>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {deck.cards.length} Flashcards
              </span>
              {deck.sourceType && (
                <span className="text-xs text-slate-500">
                  Extracted from {deck.sourceName || deck.sourceType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={deck.title}
                onChange={(e) => onUpdateDeck({ ...deck, title: e.target.value })}
                className="text-lg sm:text-xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 -mx-1 transition-colors w-full max-w-xl"
                placeholder="Deck Title"
              />
            </div>

            {deck.description && (
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                {deck.description}
              </p>
            )}
            {deck.detectedTopics && deck.detectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {deck.detectedTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onSaveToLibrary && (
              <button
                onClick={handleSaveClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                title="Save current deck into MBBS Subject Library"
              >
                {savedBadge ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Saved to {deck.subject || 'Library'}!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-blue-600" />
                    <span>Save to {deck.subject || 'Library'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Share via WhatsApp, Telegram, Instagram, or Native Android"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share (WA/IG/TG)</span>
            </button>

            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Practice & verify card flips"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulator</span>
            </button>

            <button
              onClick={onOpenRawExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
              title="Inspect raw CSV/TSV format and copy code"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Raw Format</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{delimConfig.ext}</span>
            </button>
          </div>
        </div>

        {/* Delimiter Quick Switcher & Format Settings Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Active Export Format:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['tab', 'comma', 'semicolon', 'colon'] as DelimiterType[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDelimiter(d)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeDelimiter === d
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d === 'tab' ? 'Tab (TSV/TXT) ⭐' : d === 'comma' ? 'CSV (,)' : d === 'semicolon' ? 'Semicolon (;)' : 'Colon (:)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenGuide}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>View AnkiDroid Import Steps</span>
            </button>

            <button
              onClick={handleAddCard}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Card</span>
            </button>
          </div>
        </div>

        {/* Share feedback status toast */}
        {shareStatus && (
          <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{shareStatus}</span>
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {deck.cards.map((card, index) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>

                <select
                  value={card.type}
                  onChange={(e) =>
                    handleUpdateCard(card.id, { type: e.target.value as any })
                  }
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                >
                  <option value="basic">Basic (Front/Back)</option>
                  <option value="cloze">Cloze Deletion ({"{{c1::...}}"})</option>
                  <option value="reversible">Reversible</option>
                  <option value="definition">Key Definition</option>
                </select>

                {card.type === 'cloze' && (
                  <button
                    type="button"
                    onClick={() => handleInsertCloze(card.id, card.front)}
                    className="text-[11px] px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors"
                    title="Select text and click to wrap in {{c1::...}}"
                  >
                    + Wrap in {"{{c1::...}}"}
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDeleteCard(card.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete this card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Front & Back Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {card.type === 'cloze' ? 'Front (Text with {{c1::...}}):' : 'Front (Question / Concept):'}
                </label>
                <textarea
                  id={`front-textarea-${card.id}`}
                  value={card.front}
                  onChange={(e) => handleUpdateCard(card.id, { front: e.target.value })}
                  rows={3}
                  className="w-full text-xs font-sans p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  placeholder={
                    card.type === 'cloze'
                      ? 'e.g. {{c1::Mitochondria}} is the powerhouse of the cell.'
                      : 'e.g. What organelle generates most of the chemical energy in cells?'
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {card.type === 'cloze' ? 'Back (Extra Context / Mnemonic):' : 'Back (Answer / Explanation):'}
                </label>
                <textarea
                  value={card.back}
                  onChange={(e) => handleUpdateCard(card.id, { back: e.target.value })}
                  rows={3}
                  className="w-full text-xs font-sans p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  placeholder="e.g. Generates ATP via oxidative phosphorylation."
                />
              </div>
            </div>

            {/* Tags & Notes Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">Tags:</span>
                <input
                  type="text"
                  value={card.tags?.join(', ') || ''}
                  onChange={(e) =>
                    handleUpdateCard(card.id, {
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim().toLowerCase().replace(/\s+/g, '_'))
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g. biology, chapter1"
                  className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-slate-700 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {card.type === 'cloze' && (
                <span className="text-[10px] text-blue-600 font-mono">
                  {card.front.includes('{{c') ? '✓ Valid Cloze' : '⚠️ Missing {{c1::...}}'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
