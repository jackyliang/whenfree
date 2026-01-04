'use client';

import { useState, useEffect } from 'react';

interface CalendarProps {
  selectedDates: string[];
  onDateToggle: (date: string) => void;
  selectableDates?: string[];
  minDate?: Date;
}

export default function Calendar({
  selectedDates,
  onDateToggle,
  selectableDates,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // If there are selectable dates, start with the first one's month
    if (selectableDates && selectableDates.length > 0) {
      const firstDate = new Date(selectableDates[0] + 'T00:00:00');
      return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    }
    // Otherwise default to current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Update month when selectableDates changes (e.g., on initial load)
  useEffect(() => {
    if (selectableDates && selectableDates.length > 0) {
      const sortedDates = [...selectableDates].sort();
      const firstDate = new Date(sortedDates[0] + 'T00:00:00');
      setCurrentMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
    }
  }, [selectableDates]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const goToPrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const formatDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const isDateSelectable = (day: number) => {
    const dateStr = formatDate(day);
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (selectableDates) {
      return selectableDates.includes(dateStr);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = (day: number) => {
    return selectedDates.includes(formatDate(day));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="card-elevated p-5 sm:p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--cream-dark)] transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5 text-[var(--warm-gray)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-xl font-semibold text-[var(--warm-brown)] font-display">
          {monthName}
        </h3>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--cream-dark)] transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5 text-[var(--warm-gray)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[var(--warm-gray-light)] py-2 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selectable = isDateSelectable(day);
          const selected = isDateSelected(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              onClick={() => selectable && onDateToggle(formatDate(day))}
              disabled={!selectable}
              className={`
                aspect-square rounded-2xl text-sm font-medium transition-all duration-200 relative
                ${
                  selected
                    ? 'bg-[var(--coral)] text-white shadow-lg shadow-[var(--coral)]/30 scale-105 z-10'
                    : selectable
                    ? 'hover:bg-[var(--peach-light)] text-[var(--warm-brown)] hover:scale-105'
                    : 'text-[var(--warm-gray-light)]/40 cursor-not-allowed'
                }
                ${today && !selected ? 'ring-2 ring-[var(--amber)] ring-offset-2' : ''}
              `}
            >
              {day}
              {selected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--amber)] rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selection hint */}
      {selectableDates && (
        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-4">
          Tap available dates to select
        </p>
      )}
    </div>
  );
}
