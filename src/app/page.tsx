'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { createEvent, TimeSlot } from '@/lib/actions';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [adminCode, setAdminCode] = useState('');

  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const canProceedStep1 = title.trim().length > 0;
  const canProceedStep2 = selectedDates.length > 0 && timeSlots.length > 0;
  const canSubmit = adminCode.length === 4;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await createEvent({
        title: title.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        adminCode,
        hostDates: selectedDates.sort(),
        timeSlots,
      });

      router.push(`/${result.id}/created`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['Details', 'Schedule', 'Secure'];

  return (
    <main className="min-h-screen bg-[var(--cream)] noise-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-coral w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
      <div className="blob blob-peach w-96 h-96 -bottom-32 -left-32 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      <div className="blob blob-amber w-64 h-64 top-1/2 right-0 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="inline-block mb-4">
            <span className="text-5xl">📅</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[var(--warm-brown)] mb-3 tracking-tight">
            WhenFree
          </h1>
          <p className="text-[var(--warm-gray)] text-lg">
            Find the perfect time to hang with your people
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${s === step
                    ? 'bg-[var(--coral)] text-white shadow-lg shadow-[var(--coral)]/30 scale-110'
                    : s < step
                    ? 'bg-[var(--sage)] text-white'
                    : 'bg-[var(--cream-dark)] text-[var(--warm-gray-light)]'
                  }
                `}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-1 rounded-full transition-all duration-300 ${s < step ? 'bg-[var(--sage)]' : 'bg-[var(--cream-dark)]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <p className="text-center text-sm font-medium text-[var(--warm-gray)] mb-6 uppercase tracking-widest">
          {stepLabels[step - 1]}
        </p>

        {step === 1 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="card-elevated p-6 sm:p-8">
              <h2 className="text-2xl font-display font-semibold text-[var(--warm-brown)] mb-6">
                What&apos;s the occasion?
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-2">
                    Give it a name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summer BBQ, Game Night, Brunch..."
                    className="input-warm"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-2">
                    Where at? <span className="font-normal text-[var(--warm-gray-light)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="My place, the park, TBD..."
                    className="input-warm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-2">
                    Any deets? <span className="font-normal text-[var(--warm-gray-light)]">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="BYOB, bring a dish, wear comfy clothes..."
                    rows={3}
                    className="input-warm resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className={`btn-primary w-full ${!canProceedStep1 && 'opacity-50 cursor-not-allowed'}`}
            >
              Next: Pick your dates →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="card-elevated p-6 sm:p-8">
              <h2 className="text-2xl font-display font-semibold text-[var(--warm-brown)] mb-2">
                When works for you?
              </h2>
              <p className="text-[var(--warm-gray)] text-sm mb-6">
                Pick time slots and dates you&apos;re free
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-3">
                  What time of day?
                </label>
                <TimeSlotSelector selected={timeSlots} onChange={setTimeSlots} />
              </div>
            </div>

            <Calendar selectedDates={selectedDates} onDateToggle={handleDateToggle} />

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

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={`btn-primary flex-1 ${!canProceedStep2 && 'opacity-50 cursor-not-allowed'}`}
              >
                Almost done →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="card-elevated p-6 sm:p-8">
              <div className="text-center mb-6">
                <span className="text-4xl mb-4 block">🔐</span>
                <h2 className="text-2xl font-display font-semibold text-[var(--warm-brown)] mb-2">
                  Set a secret code
                </h2>
                <p className="text-[var(--warm-gray)] text-sm">
                  You&apos;ll need this to see responses later
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={adminCode[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val) {
                        const newCode = adminCode.split('');
                        newCode[i] = val;
                        setAdminCode(newCode.join(''));
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        if (next && val) next.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !adminCode[i]) {
                        const prev = (e.target as HTMLElement)
                          .previousElementSibling as HTMLInputElement;
                        if (prev) {
                          prev.focus();
                          setAdminCode((c) => c.slice(0, -1));
                        }
                      }
                    }}
                    className="w-16 h-20 text-center text-3xl font-bold rounded-2xl border-2 border-[var(--warm-gray-light)]/20 bg-[var(--cream-dark)] focus:border-[var(--coral)] focus:ring-4 focus:ring-[var(--coral)]/10 outline-none transition-all"
                  />
                ))}
              </div>

              <p className="text-center text-xs text-[var(--warm-gray-light)]">
                4 digits to keep things safe
              </p>
            </div>

            <div className="bg-[var(--peach-light)] rounded-2xl p-4 border border-[var(--peach)] flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-[var(--warm-brown)]">
                <span className="font-semibold">Pro tip:</span> Write this down or screenshot it. You&apos;ll need it to check who&apos;s free!
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`btn-primary flex-1 ${(!canSubmit || isSubmitting) && 'opacity-50 cursor-not-allowed'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Event 🎉'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-12">
          Made for friends who can never pick a date 💛
        </p>
      </div>
    </main>
  );
}
