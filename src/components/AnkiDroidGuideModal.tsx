import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Smartphone, FileSpreadsheet, ArrowRight, HelpCircle, Copy, Check } from 'lucide-react';
import { DelimiterType } from '../types';
import { DELIMITER_MAP, getAnkiDroidInstructions } from '../utils/ankiExport';

interface AnkiDroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDelimiter: DelimiterType;
  currentNoteType: 'Basic' | 'Cloze';
  deckTitle: string;
}

export const AnkiDroidGuideModal: React.FC<AnkiDroidGuideModalProps> = ({
  isOpen,
  onClose,
  currentDelimiter,
  currentNoteType,
  deckTitle
}) => {
  const [activeDelimiter, setActiveDelimiter] = useState<DelimiterType>(currentDelimiter);
  const [activeNoteType, setActiveNoteType] = useState<'Basic' | 'Cloze'>(currentNoteType);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const instructions = getAnkiDroidInstructions(activeDelimiter, activeNoteType, true, deckTitle);
  const delimInfo = DELIMITER_MAP[activeDelimiter];

  const sampleDirectives = `#separator:${delimInfo.ankiHeader}
#html:true
#notetype:${activeNoteType}
#tags column:3
#deck:${deckTitle || 'My_Deck'}`;

  const handleCopyDirectives = () => {
    navigator.clipboard.writeText(sampleDirectives);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                AnkiDroid Import Procedure & Guide
              </h2>
              <p className="text-xs text-slate-500">
                Complete step-by-step instructions to import into AnkiDroid without errors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Delimiter & Note Type Selector for Customizing Instructions */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Customize Instructions for Your File Format:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Delimiter format:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['tab', 'comma', 'semicolon', 'colon'] as DelimiterType[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveDelimiter(d)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border text-left transition-all ${
                        activeDelimiter === d
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d === 'tab' ? 'Tab (TSV/TXT) ⭐' : d === 'comma' ? 'Comma (CSV)' : d === 'semicolon' ? 'Semicolon (;)' : 'Colon (:)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Card Note Type:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Basic', 'Cloze'] as const).map((nt) => (
                    <button
                      key={nt}
                      onClick={() => setActiveNoteType(nt)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border text-left transition-all ${
                        activeNoteType === nt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {nt === 'Basic' ? 'Basic (Front/Back)' : 'Cloze ({{c1::...}})'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs text-blue-700 flex items-start gap-1.5 mt-2">
              <span className="font-semibold">Recommendation:</span>
              <span>
                <strong>Tab-separated (.tsv/.txt)</strong> is AnkiDroid\'s most reliable format because questions often contain commas or colons.
              </span>
            </div>
          </div>

          {/* Golden Rule: The Anki Headers Feature */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Configuration Auto-Import with Anki Headers</span>
              </div>
              <button
                onClick={handleCopyDirectives}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                title="Copy headers"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Our generator automatically puts special Anki directives at the very top of your downloaded file. When AnkiDroid opens this file, it automatically configures the separator, HTML rendering, and note type without you having to guess!
            </p>
            <pre className="mt-2 bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-xs font-mono overflow-x-auto">
              {sampleDirectives}
            </pre>
          </div>

          {/* Step-by-Step Procedure */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
              Step-by-Step Import Procedure on Android
            </h3>

            <div className="space-y-3">
              {instructions.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="border border-slate-200 rounded-xl p-3.5 hover:border-blue-200 transition-colors bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="text-sm font-semibold text-slate-800">
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                        {step.description}
                      </div>
                      {step.tip && (
                        <div className="text-[11px] text-blue-600 bg-blue-50/70 px-2.5 py-1 rounded-md mt-1.5 flex items-start gap-1">
                          <span className="font-semibold shrink-0">Pro Tip:</span>
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloze Specific Instructions if Cloze is Active */}
          {activeNoteType === 'Cloze' && (
            <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                {"Crucial for Cloze Deletion Cards ({{c1::...}})"}
              </h4>
              <p className="text-xs text-purple-800 leading-relaxed">
                In AnkiDroid, cloze deletion cards <strong>must be mapped to the "Cloze" note type</strong>.
                If imported as "Basic", AnkiDroid will show the raw brackets <code>{"{{c1::answer}}"}</code> instead of the interactive hidden test prompt <code>[...]</code>.
                Our exported file already specifies <code>#notetype:Cloze</code> to prevent this automatically.
              </p>
            </div>
          )}

          {/* Troubleshooting FAQs */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Troubleshooting & Problem Prevention
            </h3>
            <div className="space-y-2.5">
              {instructions.troubleshooting.map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">Q:</span>
                    <span>{item.issue}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 pl-4 leading-relaxed">
                    <span className="font-semibold text-emerald-700">Fix: </span>
                    {item.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>AnkiDroid is free & open-source on Android via Google Play / F-Droid.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            Got it, ready to import
          </button>
        </div>
      </div>
    </div>
  );
};
