import React, { useState } from 'react';
import { X, Copy, Check, Download, Share2, FileCode, CheckCircle2 } from 'lucide-react';
import { DelimiterType, Flashcard } from '../types';
import { DELIMITER_MAP, generateAnkiExportText, downloadAnkiFile, shareToAnkiDroid } from '../utils/ankiExport';

interface RawExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  initialDelimiter: DelimiterType;
  deckTitle: string;
}

export const RawExportModal: React.FC<RawExportModalProps> = ({
  isOpen,
  onClose,
  cards,
  initialDelimiter,
  deckTitle
}) => {
  const [selectedDelimiter, setSelectedDelimiter] = useState<DelimiterType>(initialDelimiter);
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportText = generateAnkiExportText(cards, selectedDelimiter, {
    includeHeaders,
    includeTags,
    noteType: cards.some(c => c.type === 'cloze') ? 'Cloze' : 'Basic',
    deckName: deckTitle
  });

  const delimConfig = DELIMITER_MAP[selectedDelimiter];
  const filename = `${(deckTitle || 'AnkiDroid_Deck').replace(/[^a-zA-Z0-9_-]/g, '_')}.${delimConfig.ext}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadAnkiFile(exportText, filename, selectedDelimiter);
  };

  const handleShare = async () => {
    setShareFeedback('Preparing share for AnkiDroid...');
    const result = await shareToAnkiDroid(exportText, filename, selectedDelimiter);
    setShareFeedback(result.message);
    setTimeout(() => setShareFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AnkiDroid Export Raw Preview & File Generator
              </h2>
              <p className="text-xs text-slate-500">
                Inspect the exact formatting, delimiters, and headers sent to AnkiDroid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Format Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delimiter Format:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['tab', 'comma', 'semicolon', 'colon'] as DelimiterType[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDelimiter(d)}
                    className={`text-xs px-2 py-1.5 rounded-lg font-medium border text-left transition-all ${
                      selectedDelimiter === d
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d === 'tab' ? 'Tab (TSV)' : d === 'comma' ? 'Comma (CSV)' : d === 'semicolon' ? 'Semicolon (;)' : 'Colon (:)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Anki Compatibility Directives:
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Anki Directives (<code>#separator</code>, <code>#html</code>)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTags}
                    onChange={(e) => setIncludeTags(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Tags Column</span>
                </label>
              </div>
            </div>
          </div>

          {/* Feedback message if any */}
          {shareFeedback && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shareFeedback}</span>
            </div>
          )}

          {/* Code View */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>Preview ({cards.length} cards):</span>
              <span className="font-mono text-[11px] text-slate-400">Filename: {filename}</span>
            </div>
            <textarea
              readOnly
              value={exportText}
              rows={10}
              className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy All Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              title="Open Android share sheet or download"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to AnkiDroid</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{delimConfig.ext}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
