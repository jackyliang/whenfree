'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import CodeInput from '@/components/CodeInput';
import { createEvent, TimeSlot } from '@/lib/actions';

const stepLabels = ['Details', 'Schedule', 'Secure'];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [adminCode, setAdminCode] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const canProceedStep1 = title.trim().length > 0;
  const canProceedStep2 = selectedDates.length > 0 && timeSlots.length > 0;
  const canSubmit = adminCode.length === 4;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const result = await createEvent({
        title: title.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        adminCode,
        hostDates: [...selectedDates].sort(),
        timeSlots,
      });

      router.push(`/${result.id}/created`);
    } catch (error) {
      console.error('Failed to create event:', error);
      setSubmitError("Couldn't create your event. Please try again.");
      setIsSubmitting(false);
    }
  };

  const step2Label =
    timeSlots.length === 0
      ? 'Pick a time of day'
      : selectedDates.length === 0
      ? 'Pick some dates'
      : `Next · ${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''}`;

  return (
    <main className="min-h-dvh bg-[var(--cream)] noise-bg relative overflow-x-clip">
      <div className="blob blob-coral w-72 h-72 -top-24 -right-24 animate-pulse-soft" />
      <div className="blob blob-peach w-96 h-96 -bottom-32 -left-32 animate-pulse-soft" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-8 pb-6 sm:py-16 min-h-dvh flex flex-col">
        <header className="text-center mb-6 sm:mb-10 animate-fadeInUp">
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-[var(--warm-brown)] tracking-tight">
            <span className="mr-2">📅</span>WhenFree
          </h1>
          <p className="text-[var(--warm-gray)] sm:text-lg mt-1.5 sm:mt-3">
            Find the perfect time to hang with your people
          </p>
        </header>

        <ol className="flex items-start justify-center gap-2 mb-6 sm:mb-8" aria-label="Progress">
          {stepLabels.map((label, i) => {
            const s = i + 1;
            return (
              <li key={label} className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1.5 w-16">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      s === step
                        ? 'bg-[var(--coral)] text-white shadow-lg shadow-[var(--coral)]/30'
                        : s < step
                        ? 'bg-[var(--sage)] text-white'
                        : 'bg-[var(--cream-dark)] text-[var(--warm-gray-light)] border border-[var(--warm-gray-light)]/15'
                    }`}
                    aria-current={s === step ? 'step' : undefined}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${s === step ? 'text-[var(--warm-brown)]' : 'text-[var(--warm-gray-light)]'}`}>
                    {label}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`mt-4 w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-300 ${s < step ? 'bg-[var(--sage)]' : 'bg-[var(--warm-gray-light)]/20'}`} />
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex-1 flex flex-col">
          {step === 1 && (
            <form
              className="flex-1 flex flex-col gap-6 animate-fadeInUp"
              onSubmit={(e) => {
                e.preventDefault();
                if (canProceedStep1) setStep(2);
              }}
            >
              <div className="card-elevated p-5 sm:p-8">
                <h2 className="text-2xl font-display font-semibold text-[var(--warm-brown)] mb-5">
                  What&apos;s the occasion?
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-[var(--warm-brown)] mb-2">
                      Give it a name
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Summer BBQ, Game Night, Brunch..."
                      className="input-warm"
                      enterKeyHint="next"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-[var(--warm-brown)] mb-2">
                      Where at? <span className="font-normal text-[var(--warm-gray-light)]">(optional)</span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="My place, the park, TBD..."
                      className="input-warm"
                      enterKeyHint="next"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-[var(--warm-brown)] mb-2">
                      Any deets? <span className="font-normal text-[var(--warm-gray-light)]">(optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="BYOB, bring a dish, wear comfy clothes..."
                      rows={3}
                      className="input-warm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="action-bar mt-auto">
                <button type="submit" disabled={!canProceedStep1} className="btn-primary w-full">
                  {canProceedStep1 ? 'Next: Pick your dates →' : 'Give it a name first'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col gap-4 sm:gap-6 animate-fadeInUp">
              <div className="card-elevated p-5 sm:p-8">
                <h2 className="text-2xl font-display font-semibold text-[var(--warm-brown)] mb-1">
                  When works for you?
                </h2>
                <p className="text-[var(--warm-gray)] text-sm mb-4">
                  Pick a time of day, then the dates you&apos;re free
                </p>
                <TimeSlotSelector selected={timeSlots} onChange={setTimeSlots} />
              </div>

              <Calendar selectedDates={selectedDates} onDateToggle={handleDateToggle} />

              <div className="action-bar mt-auto flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary px-5" aria-label="Back">
                  ←
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="btn-primary flex-1"
                >
                  {step2Label}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              className="flex-1 flex flex-col gap-6 animate-fadeInUp"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="card-elevated p-5 sm:p-8 text-center">
                <span className="text-4xl mb-3 block">🔐</span>
                <h2 className="text-2xl font-display font-semibold text-[var(--warm-brown)] mb-1">
                  Set a secret code
                </h2>
                <p className="text-[var(--warm-gray)] text-sm mb-6">
                  4 digits you&apos;ll use to see who&apos;s free
                </p>

                <CodeInput value={adminCode} onChange={setAdminCode} onComplete={handleSubmit} autoFocus />

                <p className="text-xs text-[var(--warm-gray-light)] mt-5">
                  💡 Screenshot or jot it down. There&apos;s no reset!
                </p>
              </div>

              {submitError && (
                <p role="alert" className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-xl">
                  {submitError}
                </p>
              )}

              <div className="action-bar mt-auto flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary px-5" aria-label="Back">
                  ←
                </button>
                <button type="submit" disabled={!canSubmit || isSubmitting} className="btn-primary flex-1">
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
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-8 sm:mt-12">
          Built with &lt;3 by Jacky and Christine
        </p>
      </div>
    </main>
  );
}
