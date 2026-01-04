'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
        copied
          ? 'bg-[var(--sage)] text-white'
          : 'bg-[var(--coral)] text-white hover:bg-[var(--coral-dark)] shadow-md shadow-[var(--coral)]/20'
      }`}
    >
      {copied ? '✓' : 'Copy'}
    </button>
  );
}
