import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Smartphone, Check, Eye } from 'lucide-react';
import { Flashcard } from '../types';

interface AnkiSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  deckTitle: string;
}

export const AnkiSimulatorModal: React.FC<AnkiSimulatorModalProps> = ({
  isOpen,
  onClose,
  cards,
  deckTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  // Helper to render Cloze front (masking {{c1::word}} to [...])
  const renderClozeFront = (text: string) => {
    const clozeRegex = /\{\{c\d+::([^:}]+)(?:::([^}]+))?\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = clozeRegex.exec(text)) !== null) {
      // Push text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const hint = match[2];
      parts.push(
        <span
          key={match.index}
          className="inline-block px-1.5 py-0.5 mx-0.5 font-bold text-blue-700 bg-blue-100 rounded border border-blue-300"
        >
          [{hint ? hint : '...'}]
        </span>
      );
      lastIndex = clozeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Helper to render Cloze back (revealing the masked words with highlight)
  const renderClozeBack = (text: string) => {
    const clozeRegex = /\{\{c\d+::([^:}]+)(?:::([^}]+))?\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = clozeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const answer = match[1];
      parts.push(
        <span
          key={match.index}
          className="inline-block px-1.5 py-0.5 mx-0.5 font-bold text-emerald-800 bg-emerald-100 rounded border border-emerald-300"
        >
          {answer}
        </span>
      );
      lastIndex = clozeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
        {/* Phone Frame Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold truncate max-w-[220px]">
              {deckTitle || 'AnkiDroid Simulator'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} / {cards.length}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Screen Container */}
        <div className="p-6 bg-slate-900 min-h-[340px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium uppercase text-[10px] tracking-wider">
                {currentCard.type.toUpperCase()} CARD
              </span>
              {currentCard.tags && currentCard.tags.length > 0 && (
                <div className="flex gap-1 overflow-x-auto max-w-[200px]">
                  {currentCard.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/40">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Front of Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 text-slate-100 text-base leading-relaxed">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {currentCard.type === 'cloze' ? 'Cloze Context:' : 'Question:'}
              </div>
              <div className="text-base font-medium">
                {currentCard.type === 'cloze'
                  ? renderClozeFront(currentCard.front)
                  : currentCard.front}
              </div>
            </div>

            {/* Back of Card (Shown only when flipped) */}
            {isFlipped && (
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-5 text-emerald-200 text-base leading-relaxed animate-in fade-in duration-200">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Answer / Context:
                </div>
                {currentCard.type === 'cloze' ? (
                  <div>
                    <div className="text-base mb-2">
                      {renderClozeBack(currentCard.front)}
                    </div>
                    {currentCard.back && (
                      <div className="text-xs text-slate-300 pt-2 border-t border-emerald-900/60 mt-2">
                        <strong className="text-emerald-400">Note:</strong> {currentCard.back}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-base font-semibold text-white">
                    {currentCard.back}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Eye className="w-4 h-4" />
                <span>Show Answer</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={handleNext}
                    className="py-2.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-300 text-xs font-semibold flex flex-col items-center justify-center transition-colors"
                  >
                    <span>Again</span>
                    <span className="text-[10px] text-red-400 font-normal">&lt; 1m</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="py-2.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800/50 text-amber-300 text-xs font-semibold flex flex-col items-center justify-center transition-colors"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] text-amber-400 font-normal">6m</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="py-2.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800/50 text-blue-300 text-xs font-semibold flex flex-col items-center justify-center transition-colors"
                  >
                    <span>Good</span>
                    <span className="text-[10px] text-blue-400 font-normal">10m</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="py-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center transition-colors"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] text-emerald-400 font-normal">4d</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simulator Navigation Bar */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors p-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors px-2 py-1 rounded bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Flip Card
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors p-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
