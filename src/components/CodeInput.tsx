'use client';

import { useRef, useState } from 'react';

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: () => void;
  autoFocus?: boolean;
  invalid?: boolean;
}

export default function CodeInput({ value, onChange, onComplete, autoFocus, invalid }: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative mx-auto w-fit" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        enterKeyHint="done"
        maxLength={4}
        value={value}
        autoFocus={autoFocus}
        aria-label="4-digit code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.length === 4) onComplete?.();
        }}
        className="absolute inset-0 w-full h-full opacity-0 text-base caret-transparent"
      />
      <div className="flex gap-2.5 sm:gap-3 pointer-events-none" aria-hidden>
        {[0, 1, 2, 3].map((i) => {
          const active = focused && (i === value.length || (i === 3 && value.length === 4));
          return (
            <div
              key={i}
              className={`w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center text-3xl font-bold rounded-2xl border-2 transition-all bg-[var(--cream-dark)] text-[var(--warm-brown)] ${
                invalid
                  ? 'border-[var(--coral)] animate-shake'
                  : active
                  ? 'border-[var(--coral)] ring-4 ring-[var(--coral)]/10 bg-white'
                  : value[i]
                  ? 'border-[var(--peach)] bg-white'
                  : 'border-transparent'
              }`}
            >
              {value[i] || (active ? <span className="w-0.5 h-7 bg-[var(--coral)] animate-pulse rounded" /> : '')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
