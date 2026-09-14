/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { CardEditor } from './components/CardEditor';
import { MbbsDeckLibrary } from './components/MbbsDeckLibrary';
import { ShareDeckModal } from './components/ShareDeckModal';
import { AnkiDroidGuideModal } from './components/AnkiDroidGuideModal';
import { AnkiSimulatorModal } from './components/AnkiSimulatorModal';
import { RawExportModal } from './components/RawExportModal';
import { DeckData, AnalysisRequest, MbbsSubject } from './types';
import { 
  loadSavedDecks, 
  saveDeckToStorage, 
  deleteDeckFromStorage, 
  updateDeckSubjectInStorage 
} from './utils/deckStorage';
import { 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Layers,
  AlertCircle,
  Share2,
  BookOpen,
  GraduationCap,
  Edit3,
  Plus,
  X
} from 'lucide-react';

export default function App() {
  // Saved decks in local storage
  const [savedDecks, setSavedDecks] = useState<DeckData[]>([]);

  // Active deck state (for editor and generator)
  const [currentDeck, setCurrentDeck] = useState<DeckData | null>(null);

  // Active view: 'library' (default), 'generator' (scan/paste), 'editor' (card studio)
  const [activeView, setActiveView] = useState<'library' | 'generator' | 'editor'>('library');

  // Active MBBS Subject filter for library / generator
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [targetGenerateSubject, setTargetGenerateSubject] = useState<MbbsSubject>('Pharmacology');

  // Loading & error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isRawExportOpen, setIsRawExportOpen] = useState(false);
  const [shareModalDeck, setShareModalDeck] = useState<DeckData | null>(null);
  const [simulatorDeck, setSimulatorDeck] = useState<DeckData | null>(null);

  // Initialize saved decks on client mount
  useEffect(() => {
    const loaded = loadSavedDecks();
    setSavedDecks(loaded);
    if (loaded.length > 0 && !currentDeck) {
      setCurrentDeck(loaded[0]);
    }
  }, []);

  const [lastPayload, setLastPayload] = useState<AnalysisRequest | null>(null);

  // Safe handler for switching to editor
  const handleSwitchView = (view: 'library' | 'generator' | 'editor') => {
    if (view === 'editor' && !currentDeck && savedDecks.length > 0) {
      setCurrentDeck(savedDecks[0]);
    }
    setActiveView(view);
  };

  // Handle Gemini analysis
  const handleAnalyze = async (payload: AnalysisRequest) => {
    setLastPayload(payload);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze and generate flashcards');
      }

      const newDeck: DeckData = data.deck;
      // If subject was requested, ensure it's saved
      if (payload.subject) {
        newDeck.subject = payload.subject;
      }

      // Save to storage
      const updatedList = saveDeckToStorage(newDeck);
      setSavedDecks(updatedList);
      setCurrentDeck(newDeck);

      // Switch view to editor so user can immediately see and refine their cards
      setActiveView('editor');
    } catch (err: any) {
      console.error('Flashcard generation failed:', err);
      setError(
        err.message || 'Error communicating with the flashcard generator. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load a preset sample deck
  const handleLoadSample = (sampleId: string) => {
    const found = savedDecks.find((s) => s.id === sampleId);
    if (found) {
      setCurrentDeck(found);
      setActiveView('editor');
      setError(null);
    }
  };

  // Open deck in editor
  const handleOpenDeckInEditor = (deck: DeckData) => {
    setCurrentDeck(deck);
    setActiveView('editor');
  };

  // Open simulator for a specific deck
  const handleOpenSimulator = (deck: DeckData) => {
    setSimulatorDeck(deck);
    setIsSimulatorOpen(true);
  };

  // Update current deck and save
  const handleUpdateCurrentDeck = (updated: DeckData) => {
    setCurrentDeck(updated);
    const updatedList = saveDeckToStorage(updated);
    setSavedDecks(updatedList);
  };

  // Save current deck explicitly
  const handleSaveCurrentDeck = () => {
    if (currentDeck) {
      const updatedList = saveDeckToStorage(currentDeck);
      setSavedDecks(updatedList);
    }
  };

  // Delete deck
  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      const updatedList = deleteDeckFromStorage(deckId);
      setSavedDecks(updatedList);
      if (currentDeck?.id === deckId) {
        setCurrentDeck(updatedList.length > 0 ? updatedList[0] : null);
      }
    }
  };

  // Update deck subject
  const handleUpdateDeckSubject = (deckId: string, subject: MbbsSubject) => {
    const updatedList = updateDeckSubjectInStorage(deckId, subject);
    setSavedDecks(updatedList);
    if (currentDeck?.id === deckId) {
      setCurrentDeck({ ...currentDeck, subject });
    }
  };

  // Start new deck for subject
  const handleCreateNewDeckForSubject = (subj?: MbbsSubject) => {
    if (subj) {
      setTargetGenerateSubject(subj);
    }
    setActiveView('generator');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top clearance space for host phone native status bar, camera punch-hole, time, battery & notifications */}
      <div 
        className="w-full bg-slate-100/60 border-b border-slate-200/40 shrink-0 h-6 sm:h-7" 
        style={{ height: 'max(env(safe-area-inset-top, 0px), 1.5rem)' }}
        aria-hidden="true" 
      />

      {/* Navigation Header with the 3 options neatly accommodated in the same horizontal space */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSimulator={() => {
          if (currentDeck) {
            setSimulatorDeck(currentDeck);
            setIsSimulatorOpen(true);
          }
        }}
        hasCards={Boolean(currentDeck && currentDeck.cards.length > 0)}
        activeView={activeView}
        onChangeView={handleSwitchView}
        savedDecksCount={savedDecks.length}
      />

      {/* Main Container strictly bounded within viewport without horizontal sliding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Android / AnkiDroid Quick Tip Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50/50 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  MBBS Flashcards for AnkiDroid on Android
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Social Sharing Ready
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 max-w-2xl">
                Organize decks across all 19 MBBS subjects, test recall with Cloze deletions, export TSV/CSV with automatic <code className="font-mono text-blue-700 bg-blue-100/70 px-1 py-0.5 rounded text-[11px]">#separator:tab</code> headers, and share directly via WhatsApp, Telegram, &amp; Instagram.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Import Steps</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-red-800 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <div className="font-bold">Generation Failed</div>
                <div className="text-red-700 leading-relaxed">{error}</div>
                {lastPayload && (
                  <button
                    type="button"
                    onClick={() => handleAnalyze(lastPayload)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 text-red-400 hover:text-red-700 rounded-lg hover:bg-red-100/60 transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VIEW 1: MBBS SUBJECT LIBRARY & SAVED DECKS */}
        {activeView === 'library' && (
          <MbbsDeckLibrary
            savedDecks={savedDecks}
            activeSubject={activeSubject}
            onSelectSubject={setActiveSubject}
            onOpenDeckInEditor={handleOpenDeckInEditor}
            onOpenSimulator={handleOpenSimulator}
            onOpenShareModal={(deck) => setShareModalDeck(deck)}
            onDeleteDeck={handleDeleteDeck}
            onUpdateDeckSubject={handleUpdateDeckSubject}
            onCreateNewDeckForSubject={handleCreateNewDeckForSubject}
          />
        )}

        {/* VIEW 2: SCAN & GENERATE FLASHCARDS */}
        {activeView === 'generator' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Scan Study Material or Paste Medical Notes</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Upload photos of textbook pages, handwritten high-yield notes, or PDFs to extract cards.
                </p>
              </div>

              <button
                onClick={() => setActiveView('library')}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
              >
                <span className="hidden sm:inline">View MBBS Library</span>
                <span className="sm:hidden">Library</span>
                <span className="text-[10px] px-1 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {savedDecks.length}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <UploadSection
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onLoadSample={handleLoadSample}
              initialSubject={targetGenerateSubject}
            />
          </div>
        )}

        {/* VIEW 3: CARD STUDIO / EDITOR */}
        {activeView === 'editor' && (
          currentDeck ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveView('library')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    <span>Back to Library</span>
                  </button>
                  <span className="text-xs text-slate-400 hidden sm:inline">|</span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Editing deck under <strong>{currentDeck.subject || 'General Medicine'}</strong>
                  </span>
                </div>

                <button
                  onClick={() => setShareModalDeck(currentDeck)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Deck (WhatsApp/IG/TG)</span>
                  <span className="sm:hidden">Share</span>
                </button>
              </div>

              <CardEditor
                deck={currentDeck}
                onUpdateDeck={handleUpdateCurrentDeck}
                onOpenGuide={() => setIsGuideOpen(true)}
                onOpenRawExport={() => setIsRawExportOpen(true)}
                onOpenSimulator={() => {
                  setSimulatorDeck(currentDeck);
                  setIsSimulatorOpen(true);
                }}
                onOpenShareModal={() => setShareModalDeck(currentDeck)}
                onSaveToLibrary={handleSaveCurrentDeck}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <Edit3 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Active Deck Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Pick any MBBS deck from your saved library or scan/paste new medical notes to begin reviewing and editing.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => setActiveView('library')}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                >
                  Open MBBS Library ({savedDecks.length})
                </button>
                <button
                  onClick={() => setActiveView('generator')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Scan &amp; Generate
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Social Share Modal (WhatsApp, Telegram, Instagram, Native Android) */}
      <ShareDeckModal
        isOpen={Boolean(shareModalDeck)}
        onClose={() => setShareModalDeck(null)}
        deck={shareModalDeck}
      />

      {/* AnkiDroid Import Guide Modal */}
      <AnkiDroidGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentDelimiter={currentDeck?.recommendedDelimiter || 'tab'}
        currentNoteType={currentDeck?.cards.some((c) => c.type === 'cloze') ? 'Cloze' : 'Basic'}
        deckTitle={currentDeck?.title || 'MBBS Deck'}
      />

      {/* Interactive Anki Simulator Modal */}
      <AnkiSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => {
          setIsSimulatorOpen(false);
          setSimulatorDeck(null);
        }}
        cards={simulatorDeck?.cards || currentDeck?.cards || []}
        deckTitle={simulatorDeck?.title || currentDeck?.title || 'MBBS Study Deck'}
      />

      {/* Raw TSV/CSV Export Inspector Modal */}
      {currentDeck && (
        <RawExportModal
          isOpen={isRawExportOpen}
          onClose={() => setIsRawExportOpen(false)}
          cards={currentDeck.cards}
          initialDelimiter={currentDeck.recommendedDelimiter || 'tab'}
          deckTitle={currentDeck.title}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p>
            AnkiDroid Card Generator — Compatible with AnkiDroid (Android), Anki Desktop (Mac/Windows/Linux), and AnkiMobile.
          </p>
          <p className="text-[11px] text-slate-400">
            Powered by Gemini Multimodal OCR &amp; Minimum Information Principle flashcard design.
          </p>
        </div>
      </footer>
    </div>
  );
}
