import React from 'react';
import { Layers, Smartphone, HelpCircle, BookOpen, GraduationCap, PlusCircle, Edit3 } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenSimulator?: () => void;
  hasCards: boolean;
  activeView: 'library' | 'generator' | 'editor';
  onChangeView: (view: 'library' | 'generator' | 'editor') => void;
  savedDecksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenSimulator,
  hasCards,
  activeView,
  onChangeView,
  savedDecksCount
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-2xs w-full">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 space-y-2">
        {/* ROW 1: Brand & App Title on Left, Helper Actions (Simulator, Guide) on Right */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Brand & App Title */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  AnkiDroid Card Generator
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                  <Smartphone className="w-2.5 h-2.5" />
                  <span className="hidden xs:inline">Android Ready</span>
                  <span className="xs:hidden">Android</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 hidden md:block">
                MBBS high-yield flashcard creator for AnkiDroid on Android
              </p>
            </div>
          </div>

          {/* Right: Quick actions (Simulator & Guide) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hasCards && onOpenSimulator && (
              <button
                id="header-open-simulator-btn"
                onClick={onOpenSimulator}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/60"
                title="Simulate AnkiDroid card flip"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Simulator</span>
              </button>
            )}

            <button
              id="header-open-guide-btn"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
              title="Open AnkiDroid Step-by-Step Import Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Guide</span>
            </button>
          </div>
        </div>

        {/* ROW 2: The Three Primary Navigation Options Accommodated JUST BELOW THE ROW */}
        <nav 
          aria-label="Main Navigation"
          className="w-full bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shadow-2xs"
        >
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 w-full text-center">
            {/* Option 1: MBBS Library */}
            <button
              id="header-tab-library"
              onClick={() => onChangeView('library')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                activeView === 'library'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate hidden sm:inline">MBBS Library</span>
              <span className="truncate sm:hidden">Library</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800 shrink-0">
                {savedDecksCount}
              </span>
            </button>

            {/* Option 2: Scan & Generate */}
            <button
              id="header-tab-generator"
              onClick={() => onChangeView('generator')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                activeView === 'generator'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate hidden sm:inline">Scan &amp; Generate</span>
              <span className="truncate sm:hidden">Scan &amp; Gen</span>
            </button>

            {/* Option 3: Card Studio */}
            <button
              id="header-tab-editor"
              onClick={() => onChangeView('editor')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                activeView === 'editor'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : hasCards
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
              }`}
              title={hasCards ? 'Card Studio (Active Deck Ready)' : 'Card Studio'}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate hidden sm:inline">Card Studio</span>
              <span className="truncate sm:hidden">Studio</span>
              {hasCards && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Deck active"></span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
