import React, { useState } from 'react';
import { 
  BookOpen, 
  Share2, 
  Download, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Sparkles, 
  Filter, 
  Layers, 
  GraduationCap, 
  ChevronRight,
  FolderPlus,
  Copy,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { DeckData, MbbsSubject, DelimiterType } from '../types';
import { MBBS_SUBJECTS, MBBS_PHASES, getMbbsSubjectInfo } from '../utils/mbbsSubjects';
import { DELIMITER_MAP, downloadAnkiFile, generateAnkiExportText } from '../utils/ankiExport';

interface MbbsDeckLibraryProps {
  savedDecks: DeckData[];
  activeSubject: string; // 'All' or a specific MbbsSubject
  onSelectSubject: (subject: string) => void;
  onOpenDeckInEditor: (deck: DeckData) => void;
  onOpenSimulator: (deck: DeckData) => void;
  onOpenShareModal: (deck: DeckData) => void;
  onDeleteDeck: (deckId: string) => void;
  onUpdateDeckSubject: (deckId: string, subject: MbbsSubject) => void;
  onCreateNewDeckForSubject: (subject?: MbbsSubject) => void;
}

export const MbbsDeckLibrary: React.FC<MbbsDeckLibraryProps> = ({
  savedDecks,
  activeSubject,
  onSelectSubject,
  onOpenDeckInEditor,
  onOpenSimulator,
  onOpenShareModal,
  onDeleteDeck,
  onUpdateDeckSubject,
  onCreateNewDeckForSubject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('All Subjects');

  // Count decks per subject
  const deckCountsBySubject: Record<string, number> = {};
  savedDecks.forEach((d) => {
    const subj = d.subject || 'General Medicine';
    deckCountsBySubject[subj] = (deckCountsBySubject[subj] || 0) + 1;
  });

  // Filter subjects by phase
  const visibleSubjects = MBBS_SUBJECTS.filter((subj) => {
    if (selectedPhase === 'All Subjects') return true;
    return subj.phase === selectedPhase;
  });

  // Filter decks by activeSubject & searchQuery
  const filteredDecks = savedDecks.filter((deck) => {
    const matchesSubject =
      activeSubject === 'All' ||
      (deck.subject && deck.subject === activeSubject) ||
      (!deck.subject && activeSubject === 'General Medicine');

    if (!matchesSubject) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const titleMatch = deck.title.toLowerCase().includes(q);
    const descMatch = deck.description?.toLowerCase().includes(q);
    const topicMatch = deck.detectedTopics?.some((t) => t.toLowerCase().includes(q));
    const cardMatch = deck.cards.some(
      (c) => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
    );

    return titleMatch || descMatch || topicMatch || cardMatch;
  });

  const handleQuickDownload = (deck: DeckData) => {
    const delim = deck.recommendedDelimiter || 'tab';
    const delimConfig = DELIMITER_MAP[delim];
    const filename = `${(deck.title || 'AnkiDroid_Deck').replace(/[^a-zA-Z0-9_-]/g, '_')}.${delimConfig.ext}`;
    const exportText = generateAnkiExportText(deck.cards, delim, {
      includeHeaders: true,
      includeTags: true,
      noteType: deck.recommendedNoteType,
      deckName: deck.title,
    });
    downloadAnkiFile(exportText, filename, delim);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Subject Navigation Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                MBBS Subject Deck Library
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {savedDecks.length} Decks Saved
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any MBBS subject tab to manage, review, or share flashcards via WhatsApp, Telegram, and Instagram.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onCreateNewDeckForSubject(
                  activeSubject !== 'All' ? (activeSubject as MbbsSubject) : 'Pharmacology'
                )
              }
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeSubject === 'All'
                  ? 'Generate New Deck'
                  : `+ New ${activeSubject} Deck`}
              </span>
            </button>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full max-w-full overscroll-x-contain scrollbar-thin">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 mr-1">
            MBBS Prof:
          </span>
          {MBBS_PHASES.map((phase) => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedPhase === phase
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {phase}
            </button>
          ))}
        </div>

        {/* Subject Pills / Tabs */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin w-full max-w-full overscroll-x-contain">
          <button
            onClick={() => onSelectSubject('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activeSubject === 'All'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>All Subjects</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeSubject === 'All'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {savedDecks.length}
            </span>
          </button>

          {visibleSubjects.map((subj) => {
            const count = deckCountsBySubject[subj.name] || 0;
            const isSelected = activeSubject === subj.name;
            return (
              <button
                key={subj.name}
                onClick={() => onSelectSubject(subj.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? `${subj.color.bg} ${subj.color.text} border-current ring-2 ring-blue-400/30 shadow-xs font-bold`
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{subj.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/80 text-slate-900 shadow-2xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeSubject === 'All' ? 'all saved MBBS decks' : activeSubject}...`}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            No decks found in {activeSubject === 'All' ? 'this search' : activeSubject}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords.'
              : `Create or scan study notes to save your first flashcard deck under ${activeSubject}.`}
          </p>
          <button
            onClick={() =>
              onCreateNewDeckForSubject(
                activeSubject !== 'All' ? (activeSubject as MbbsSubject) : undefined
              )
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Flashcards for {activeSubject === 'All' ? 'MBBS' : activeSubject}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => {
            const subjInfo = getMbbsSubjectInfo(deck.subject);
            return (
              <div
                key={deck.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Subject Badge & Note Type Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${subjInfo.color.bg} ${subjInfo.color.text} ${subjInfo.color.border}`}
                    >
                      {subjInfo.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                        {deck.recommendedNoteType}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700">
                        {deck.cards.length} Cards
                      </span>
                    </div>
                  </div>

                  {/* Deck Title */}
                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                    {deck.title}
                  </h3>

                  {/* Description */}
                  {deck.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {deck.description}
                    </p>
                  )}

                  {/* Sample Card Preview (First card front) */}
                  {deck.cards.length > 0 && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">
                        Card #1 Preview:
                      </span>
                      <p className="line-clamp-2 font-sans italic text-slate-800">
                        "{deck.cards[0].front.replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, '$1')}"
                      </p>
                    </div>
                  )}

                  {/* Re-assign subject dropdown */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-medium">Subject Tab:</span>
                    <select
                      value={deck.subject || 'General Medicine'}
                      onChange={(e) => onUpdateDeckSubject(deck.id, e.target.value as MbbsSubject)}
                      className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {MBBS_SUBJECTS.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenDeckInEditor(deck)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit deck cards"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenSimulator(deck)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Practice flipping cards in AnkiDroid Simulator"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleQuickDownload(deck)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Direct AnkiDroid TSV Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteDeck(deck.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenShareModal(deck)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share (WA/IG/TG)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
