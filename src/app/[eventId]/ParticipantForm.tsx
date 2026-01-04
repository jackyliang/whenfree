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
      // Auto-fill with event's time slots
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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Thanks, {name}!
        </h2>
        <p className="text-gray-600 mb-6">
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
          className="text-indigo-600 font-medium hover:text-indigo-700"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          What&apos;s your name?
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          When are you free?
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Tap dates to select when you&apos;re available
        </p>

        <Calendar
          selectedDates={selectedDates}
          onDateToggle={handleDateToggle}
          selectableDates={hostDates}
        />
      </div>

      {selectedDates.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Refine your availability
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Tap a date below to adjust the time slots
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDates.sort().map((date) => (
              <button
                key={date}
                onClick={() => setActiveDate(activeDate === date ? null : date)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeDate === date
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          {activeDate && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Available times for {formatDate(activeDate)}:
              </p>
              <TimeSlotSelector
                selected={availability[activeDate] || []}
                onChange={(slots) => handleTimeSlotChange(activeDate, slots)}
              />
            </div>
          )}
        </div>
      )}

      {selectedDates.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-700">
            <span className="font-medium">{selectedDates.length}</span> date
            {selectedDates.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          canSubmit && !isSubmitting
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit My Availability'}
      </button>
    </div>
  );
}
