'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import { submitResponse, TimeSlot } from '@/lib/actions';

// Confetti particle component
function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    scale: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const colors = ['#FF6B6B', '#FFEAA7', '#F9A826', '#A8D5BA', '#FF8A8A', '#FFC048'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
          }}
        >
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: p.color }}
          />
        </div>
      ))}
    </div>
  );
}

interface ParticipantFormProps {
  eventId: string;
  hostDates: string[];
  timeSlots: TimeSlot[];
}

export default function ParticipantForm({
  eventId,
  hostDates,
  timeSlots,
}: ParticipantFormProps) {
  const [name, setName] = useState('');
  const [plusOne, setPlusOne] = useState('');
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDateToggle = (date: string) => {
    if (!hostDates.includes(date)) return;

    if (selectedDates.includes(date)) {
      setSelectedDates((prev) => prev.filter((d) => d !== date));
      setAvailability((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
    } else {
      setSelectedDates((prev) => [...prev, date]);
      // Automatically mark as available for all host's time slots
      setAvailability((prev) => ({
        ...prev,
        [date]: [...timeSlots],
      }));
    }
  };

  const canSubmit = name.trim().length > 0 && selectedDates.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await submitResponse({
        eventId,
        name: name.trim(),
        availability,
        plusOne: hasPlusOne && plusOne.trim() ? plusOne.trim() : undefined,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isSubmitted) {
    return (
      <>
        <Confetti />
        <div className="text-center py-12 animate-scaleIn">
          {/* Celebration icon with glow */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[var(--sage)] rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[var(--sage)]/30 to-[var(--sage)]/10 border border-[var(--sage)]/20">
              <span className="text-5xl animate-bounce-subtle">🎉</span>
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-[var(--warm-brown)] mb-2">
            Thanks, {name}!
          </h2>
          <p className="text-[var(--warm-gray)] mb-6">
            Your availability has been saved.
          </p>

          {/* Host will reach out message */}
          <div className="bg-gradient-to-r from-[var(--peach-light)] to-[var(--cream)] rounded-2xl p-5 mb-8 border border-[var(--peach)]/50 max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📬</span>
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--warm-brown)] mb-1">
                  What&apos;s next?
                </p>
                <p className="text-sm text-[var(--warm-gray)]">
                  The host will reach out with more details once the best date is decided. Stay tuned!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setName('');
              setPlusOne('');
              setHasPlusOne(false);
              setSelectedDates([]);
              setAvailability({});
            }}
            className="text-[var(--coral)] font-semibold hover:underline"
          >
            Submit another response →
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp stagger-1">
      {/* Name input */}
      <div className="card-elevated p-6">
        <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)] mb-2">
          First, who are you?
        </h2>
        <p className="text-sm text-[var(--warm-gray)] mb-4">
          Please use your real name so we know who you are!
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="input-warm"
          autoFocus
        />

        {/* Plus one toggle */}
        <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={hasPlusOne}
                onChange={(e) => setHasPlusOne(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--cream-dark)] rounded-full peer peer-checked:bg-[var(--coral)] transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
            </div>
            <span className="text-sm text-[var(--warm-brown)]">Bringing a +1?</span>
          </label>

          {hasPlusOne && (
            <input
              type="text"
              value={plusOne}
              onChange={(e) => setPlusOne(e.target.value)}
              placeholder="Your +1's name"
              className="input-warm mt-3"
            />
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="animate-fadeInUp stagger-2">
        <h2 className="text-lg font-display font-semibold text-[var(--warm-brown)] mb-3 px-1">
          When are you free?
        </h2>
        <Calendar
          selectedDates={selectedDates}
          onDateToggle={handleDateToggle}
          selectableDates={hostDates}
        />
      </div>

      {/* Selection count */}
      {selectedDates.length > 0 && (
        <div className="bg-[var(--peach-light)] rounded-2xl p-4 border border-[var(--peach)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <p className="text-sm text-[var(--warm-brown)]">
              <span className="font-bold">{selectedDates.length}</span> date{selectedDates.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={`btn-primary w-full ${(!canSubmit || isSubmitting) && 'opacity-50 cursor-not-allowed'}`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </span>
        ) : (
          "I'm in! 🙌"
        )}
      </button>
    </div>
  );
}
