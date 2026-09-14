import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Send, 
  MessageSquare, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  FileSpreadsheet, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { DeckData, DelimiterType } from '../types';
import { DELIMITER_MAP, generateAnkiExportText, downloadAnkiFile } from '../utils/ankiExport';
import { getMbbsSubjectInfo } from '../utils/mbbsSubjects';

interface ShareDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckData | null;
}

export const ShareDeckModal: React.FC<ShareDeckModalProps> = ({
  isOpen,
  onClose,
  deck,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'telegram' | 'instagram' | 'file'>('whatsapp');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedDelimiter, setSelectedDelimiter] = useState<DelimiterType>(deck?.recommendedDelimiter || 'tab');

  if (!isOpen || !deck) return null;

  const subjectInfo = getMbbsSubjectInfo(deck.subject);
  const delimConfig = DELIMITER_MAP[selectedDelimiter];
  const filename = `${(deck.title || 'AnkiDroid_Deck').replace(/[^a-zA-Z0-9_-]/g, '_')}.${delimConfig.ext}`;

  // Generate the formatted text representations
  const ankiRawText = generateAnkiExportText(deck.cards, selectedDelimiter, {
    includeHeaders: true,
    includeTags: true,
    noteType: deck.recommendedNoteType,
    deckName: deck.title
  });

  // Top 3 cards preview for text sharing
  const cardPreviews = deck.cards.slice(0, 3).map((c, i) => {
    const cleanFront = c.front.replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, '[$1]');
    return `Q${i + 1}: ${cleanFront}\nA: ${c.back}`;
  }).join('\n\n');

  // WhatsApp share payload
  const whatsappText = 
`🩺 *${deck.title}*
📚 *Subject:* ${deck.subject || 'MBBS High-Yield'}
🗂 *Cards:* ${deck.cards.length} ${deck.recommendedNoteType} Flashcards

*Sample Flashcards:*
${cardPreviews}
${deck.cards.length > 3 ? `\n... +${deck.cards.length - 3} more cards` : ''}

📲 *How to use in AnkiDroid:*
1. Save the deck file (.tsv or .csv)
2. Open AnkiDroid -> Menu (⋮) -> Import
3. Select file and start active recall!

✨ Created with AnkiDroid MBBS Flashcard Generator`;

  // Telegram share payload
  const telegramText = 
`🩺 ${deck.title}
📚 MBBS Subject: ${deck.subject || 'Medicine'} (${deck.cards.length} Flashcards)

Sample Flashcards:
${cardPreviews}

📲 Ready for AnkiDroid / Anki Desktop!`;

  // Instagram study post / story / DM payload
  const instagramText = 
`🧠 High-Yield MBBS Flashcards: ${deck.title}
📌 Subject: ${deck.subject || 'MBBS'} | ${deck.cards.length} Spaced Repetition Cards

${cardPreviews}

💡 Study Tip: Test your recall before checking the answer!
#MBBS #AnkiDroid #MedStudent #NeetPG #USMLE #DoctorInTraining #AnkiDecks #${(deck.subject || 'Medical').replace(/[^a-zA-Z]/g, '')}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(telegramText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInstagram = () => {
    handleCopy(instagramText, 'instagram');
    window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        // Try sharing file if File constructor and canShare are supported
        const file = new File([ankiRawText], filename, { type: delimConfig.mime });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: deck.title,
            text: `AnkiDroid Deck: ${deck.title} (${deck.cards.length} cards)`
          });
          return;
        }

        // Fallback to sharing formatted text
        await navigator.share({
          title: deck.title,
          text: whatsappText,
          url: window.location.href
        });
      } catch (err) {
        console.warn('Native share dismissed or failed:', err);
      }
    } else {
      handleCopy(whatsappText, 'all');
    }
  };

  const handleDownload = () => {
    downloadAnkiFile(ankiRawText, filename, selectedDelimiter);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${subjectInfo.color.bg} ${subjectInfo.color.text} ${subjectInfo.color.border}`}>
                  {subjectInfo.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {deck.cards.length} Cards • {deck.recommendedNoteType}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Share "{deck.title}"
              </h3>
              <p className="text-xs text-slate-500">
                Share with study partners, medical groups, or export directly to AnkiDroid.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-5 sm:px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('instagram')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'instagram'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
              IG
            </span>
            <span>Instagram</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'file'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Anki File &amp; Native Share</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* WHATSAPP TAB */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950">
                      Share via WhatsApp
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Send formatted study flashcards and AnkiDroid import instructions to WhatsApp contacts or MBBS study groups.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenWhatsApp}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Message Preview:
                  </label>
                  <button
                    onClick={() => handleCopy(whatsappText, 'whatsapp')}
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                  >
                    {copiedType === 'whatsapp' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-52 overflow-y-auto text-slate-800 leading-relaxed">
                  {whatsappText}
                </div>
              </div>
            </div>
          )}

          {/* TELEGRAM TAB */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sky-950">
                      Share via Telegram
                    </h4>
                    <p className="text-[11px] text-sky-800">
                      Post directly to Telegram medical study channels, batches, or your Saved Messages.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenTelegram}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Telegram</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Message Preview:
                  </label>
                  <button
                    onClick={() => handleCopy(telegramText, 'telegram')}
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                  >
                    {copiedType === 'telegram' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-52 overflow-y-auto text-slate-800 leading-relaxed">
                  {telegramText}
                </div>
              </div>
            </div>
          )}

          {/* INSTAGRAM TAB */}
          {activeTab === 'instagram' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-pink-950">
                      Share to Instagram
                    </h4>
                    <p className="text-[11px] text-pink-800">
                      Formatted with active recall prompts, answers, and medical hashtags for IG DMs, Stories, Broadcast Channels, or Study Notes.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenInstagram}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Copy &amp; Open IG</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Instagram Caption / Story Text Preview:
                  </label>
                  <button
                    onClick={() => handleCopy(instagramText, 'instagram')}
                    className="text-pink-600 hover:text-pink-800 font-semibold inline-flex items-center gap-1"
                  >
                    {copiedType === 'instagram' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy for Instagram</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-52 overflow-y-auto text-slate-800 leading-relaxed">
                  {instagramText}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>How to share on Instagram:</strong> Tap <em>Copy &amp; Open IG</em>, then paste the text into your Instagram Story (using the Text sticker), broadcast channel, or send directly in a DM to your med school study buddies.
                </p>
              </div>
            </div>
          )}

          {/* ANKI FILE & NATIVE SHARE TAB */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-blue-950">
                      AnkiDroid Direct File Export
                    </h4>
                    <p className="text-[11px] text-blue-800">
                      Contains official <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">#separator</code> and <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">#notetype</code> directives for one-tap import into AnkiDroid on Android.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDelimiter}
                      onChange={(e) => setSelectedDelimiter(e.target.value as DelimiterType)}
                      className="bg-white border border-blue-300 text-blue-900 rounded-lg px-2 py-1 font-semibold text-xs focus:outline-none"
                    >
                      <option value="tab">Tab (TSV) ⭐ Recommended</option>
                      <option value="comma">Comma (CSV)</option>
                      <option value="semicolon">Semicolon (;)</option>
                      <option value="colon">Colon (:)</option>
                    </select>

                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .{delimConfig.ext}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Native Android Share Sheet */}
              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">
                      Android System Share Sheet
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Use your device's native share menu to send the file directly to AnkiDroid, WhatsApp, Google Drive, or Bluetooth.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNativeShare}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Trigger Native Share</span>
                </button>
              </div>

              {/* Copy Raw TSV */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Raw Anki Text (with auto-directives):
                  </label>
                  <button
                    onClick={() => handleCopy(ankiRawText, 'raw')}
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                  >
                    {copiedType === 'raw' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied Raw TSV!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Raw Text</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] max-h-40 overflow-auto whitespace-pre leading-normal">
                  {ankiRawText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Exported cards include AnkiDroid-ready Cloze deletion syntax &amp; metadata headers.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
