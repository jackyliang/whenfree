'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { submitResponse, TimeSlot } from '@/lib/actions';

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
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const handleDateToggle = (date: string) => {
    if (!hostDates.includes(date)) return;

    if (selectedDates.includes(date)) {
      setSelectedDates((prev) => prev.filter((d) => d !== date));
      setAvailability((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      if (activeDate === date) {
        setActiveDate(null);
      }
    } else {
      setSelectedDates((prev) => [...prev, date]);
      setAvailability((prev) => ({
        ...prev,
        [date]: [...timeSlots],
      }));
      setActiveDate(date);
    }
  };

  const handleTimeSlotChange = (date: string, slots: TimeSlot[]) => {
    setAvailability((prev) => ({
      ...prev,
      [date]: slots,
    }));
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
      <div className="text-center py-12 animate-scaleIn">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--sage)]/20 mb-6">
          <span className="text-5xl">🎉</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-[var(--warm-brown)] mb-2">
          Thanks, {name}!
        </h2>
        <p className="text-[var(--warm-gray)] mb-8">
          Your availability has been saved.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setName('');
            setSelectedDates([]);
            setAvailability({});
            setActiveDate(null);
          }}
          className="text-[var(--coral)] font-semibold hover:underline"
        >
          Submit another response →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp stagger-1">
      {/* Name input */}
      <div className="card-elevated p-6">
        <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)] mb-4">
          First, who are you?
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="input-warm"
          autoFocus
        />
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

      {/* Time slot refinement */}
      {selectedDates.length > 0 && (
        <div className="card-elevated p-6 animate-scaleIn">
          <h2 className="text-lg font-display font-semibold text-[var(--warm-brown)] mb-2">
            Fine-tune your times
          </h2>
          <p className="text-[var(--warm-gray)] text-sm mb-4">
            Tap a date to adjust which times work
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDates.sort().map((date) => (
              <button
                key={date}
                onClick={() => setActiveDate(activeDate === date ? null : date)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDate === date
                    ? 'bg-[var(--coral)] text-white shadow-md'
                    : 'bg-[var(--cream-dark)] text-[var(--warm-brown)] hover:bg-[var(--peach-light)]'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          {activeDate && (
            <div className="pt-4 border-t border-[var(--cream-dark)]">
              <p className="text-sm font-medium text-[var(--warm-gray)] mb-3">
                Times for {formatDate(activeDate)}:
              </p>
              <TimeSlotSelector
                selected={availability[activeDate] || []}
                onChange={(slots) => handleTimeSlotChange(activeDate, slots)}
              />
            </div>
          )}
        </div>
      )}

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
