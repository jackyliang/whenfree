'use client';

import { useState } from 'react';

interface ShareSectionProps {
  shareUrl: string;
  eventTitle: string;
  eventLocation?: string | null;
}

export default function ShareSection({ shareUrl, eventTitle, eventLocation }: ShareSectionProps) {
  const [includeMessage, setIncludeMessage] = useState(true);
  const [copied, setCopied] = useState(false);

  // Get next week's date formatted nicely
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekFormatted = nextWeek.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const friendlyMessage = `hey! we're planning ${eventTitle}${eventLocation ? ` at ${eventLocation}` : ''}. when are you free? fill this out real quick:\n${shareUrl}\n\nplease reply by ${nextWeekFormatted} 🙏`;

  const textToCopy = includeMessage ? friendlyMessage : shareUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card-elevated p-6">
      <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-3">
        🔗 Share this with friends
      </label>

      {/* Toggle for including message */}
      <label className="flex items-center gap-3 mb-4 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={includeMessage}
            onChange={(e) => setIncludeMessage(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[var(--cream-dark)] rounded-full peer peer-checked:bg-[var(--coral)] transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
        </div>
        <span className="text-sm text-[var(--warm-brown)]">Include friendly message</span>
      </label>

      {/* Preview area */}
      {includeMessage ? (
        <div className="relative mb-3 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--peach-light)] via-[var(--cream)] to-[var(--coral)]/10 rounded-2xl" />
          <div className="absolute top-2 right-2 text-4xl opacity-20">✨</div>
          <div className="absolute bottom-2 left-2 text-3xl opacity-20">🎉</div>

          {/* Card content */}
          <div className="relative p-5 rounded-2xl border-2 border-[var(--peach)] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📨</span>
              <span className="text-xs font-semibold text-[var(--coral)] uppercase tracking-wider">Invitation Preview</span>
            </div>
            <p className="text-sm text-[var(--warm-brown)] whitespace-pre-wrap leading-relaxed">{friendlyMessage}</p>
          </div>
        </div>
      ) : (
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)] text-[var(--warm-brown)] font-mono text-sm mb-3"
        />
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
          copied
            ? 'bg-[var(--sage)] text-white'
            : 'bg-[var(--coral)] text-white hover:bg-[var(--coral-dark)] shadow-md shadow-[var(--coral)]/20'
        }`}
      >
        {copied ? '✓ Copied!' : includeMessage ? 'Copy Message' : 'Copy Link'}
      </button>
    </div>
  );
}
