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
    <div className="card-elevated p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-display font-semibold text-[var(--warm-brown)]">
          Invite your friends
        </h2>
        <div className="flex p-1 rounded-full bg-[var(--cream-dark)] text-xs font-semibold" role="tablist">
          {[
            { on: true, label: 'Message' },
            { on: false, label: 'Link' },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              role="tab"
              aria-selected={includeMessage === opt.on}
              onClick={() => setIncludeMessage(opt.on)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                includeMessage === opt.on ? 'bg-white text-[var(--warm-brown)] shadow-sm' : 'text-[var(--warm-gray)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {includeMessage ? (
        <div className="mb-3 p-4 rounded-2xl rounded-bl-md bg-[var(--peach-light)] border border-[var(--peach)]">
          <p className="text-sm text-[var(--warm-brown)] whitespace-pre-wrap break-words leading-relaxed">{friendlyMessage}</p>
        </div>
      ) : (
        <div className="mb-3 px-4 py-3 rounded-2xl bg-[var(--cream)] border-2 border-[var(--cream-dark)] text-[var(--warm-brown)] font-mono text-sm break-all">
          {shareUrl}
        </div>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className={`w-full px-5 py-3.5 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] ${
          copied
            ? 'bg-[var(--sage-dark)] text-white'
            : 'bg-[var(--coral)] text-white shadow-md shadow-[var(--coral)]/20'
        }`}
      >
        {copied ? '✓ Copied!' : includeMessage ? 'Copy message' : 'Copy link'}
      </button>
    </div>
  );
}
