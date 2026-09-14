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
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        {/* Desktop View (lg and up): All in one row, neatly proportioned */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Left Brand */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  AnkiDroid Card Generator
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Smartphone className="w-2.5 h-2.5" /> Android Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                MBBS high-yield flashcard creator for AnkiDroid on Android
              </p>
            </div>
          </div>

          {/* Middle: The Three Navigation Options accommodated neatly in the same horizontal space */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
            {/* Option 1: MBBS Library */}
            <button
              id="header-tab-library-desktop"
              onClick={() => onChangeView('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'library'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>MBBS Library</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800">
                {savedDecksCount}
              </span>
            </button>

            {/* Option 2: Scan & Generate */}
            <button
              id="header-tab-generator-desktop"
              onClick={() => onChangeView('generator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'generator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Scan &amp; Generate</span>
            </button>

            {/* Option 3: Card Studio */}
            <button
              id="header-tab-editor-desktop"
              onClick={() => onChangeView('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'editor'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : hasCards
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
              }`}
              title={hasCards ? 'Edit active deck' : 'Card Studio'}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Card Studio</span>
              {hasCards && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            {hasCards && onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/50"
                title="Simulate AnkiDroid card flip"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulator</span>
              </button>
            )}

            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>AnkiDroid Guide</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet View (<lg): 
            Accommodates all 3 options neatly in the same horizontal space via full-width grid 
            so the user NEVER has to slide the interface to the left! */}
        <div className="lg:hidden space-y-2">
          {/* Top Line: Brand & Quick Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                  AnkiDroid MBBS
                </h1>
                <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <Smartphone className="w-2.5 h-2.5" /> Android Ready
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {hasCards && onOpenSimulator && (
                <button
                  onClick={onOpenSimulator}
                  className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/60"
                  title="AnkiDroid Simulator"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                </button>
              )}

              <button
                onClick={onOpenGuide}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Guide</span>
              </button>
            </div>
          </div>

          {/* Bottom Line: The Three Options in a neat, balanced 3-column horizontal grid */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 w-full text-center">
            {/* Option 1 */}
            <button
              id="header-tab-library-mobile"
              onClick={() => onChangeView('library')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all ${
                activeView === 'library'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Library</span>
              <span className="text-[9px] px-1 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800 shrink-0">
                {savedDecksCount}
              </span>
            </button>

            {/* Option 2 */}
            <button
              id="header-tab-generator-mobile"
              onClick={() => onChangeView('generator')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all ${
                activeView === 'generator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Scan &amp; Gen</span>
            </button>

            {/* Option 3 */}
            <button
              id="header-tab-editor-mobile"
              onClick={() => onChangeView('editor')}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all ${
                activeView === 'editor'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : hasCards
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Studio</span>
              {hasCards && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
