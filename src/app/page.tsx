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

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            WhenFree
          </h1>
          <p className="text-gray-600 text-lg">
            Find the perfect time to hang out with friends
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-indigo-500'
                  : s < step
                  ? 'w-2 bg-indigo-300'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                What&apos;s the occasion?
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Summer BBQ, Game Night, Brunch Meetup"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., My place, Central Park, TBD"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any details your friends should know..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                canProceedStep1
                  ? 'bg-indigo-500 hover:bg-indigo-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Next: Pick Dates
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                When are you available?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Select the dates you could host, and what times work for you
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Time of day
                </label>
                <TimeSlotSelector selected={timeSlots} onChange={setTimeSlots} />
              </div>
            </div>

            <Calendar selectedDates={selectedDates} onDateToggle={handleDateToggle} />

            {selectedDates.length > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-indigo-700">
                  <span className="font-medium">{selectedDates.length}</span> date
                  {selectedDates.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={`flex-1 py-4 rounded-xl font-semibold text-white transition-all ${
                  canProceedStep2
                    ? 'bg-indigo-500 hover:bg-indigo-600 shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Next: Set Code
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Set your admin code
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                You&apos;ll use this 4-digit code to view responses at{' '}
                <span className="font-mono text-indigo-600">/manage</span>
              </p>

              <div className="flex justify-center gap-3">
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
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Remember this code!</span> You&apos;ll
                need it to see who responded.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`flex-1 py-4 rounded-xl font-semibold text-white transition-all ${
                  canSubmit && !isSubmitting
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
