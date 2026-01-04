'use client';

import { useState, useMemo } from 'react';

interface CalendarProps {
  selectedDates: string[];
  onDateToggle: (date: string) => void;
  selectableDates?: string[];
  minDate?: Date;
}

interface MonthData {
  year: number;
  month: number;
  key: string;
}

export default function Calendar({
  selectedDates,
  onDateToggle,
  selectableDates,
}: CalendarProps) {
  // For host view (no selectableDates), we use month navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // For guest view (with selectableDates), show all months that have dates
  const monthsToShow = useMemo(() => {
    if (!selectableDates || selectableDates.length === 0) {
      return null; // Will use single-month navigation mode
    }

    const monthsSet = new Map<string, MonthData>();

    for (const dateStr of selectableDates) {
      const date = new Date(dateStr + 'T00:00:00');
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthsSet.has(key)) {
        monthsSet.set(key, { year: date.getFullYear(), month: date.getMonth(), key });
      }
    }

    // Sort by year and month
    return Array.from(monthsSet.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [selectableDates]);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const formatDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const isDateSelectable = (year: number, month: number, day: number) => {
    const dateStr = formatDate(year, month, day);

    if (selectableDates) {
      return selectableDates.includes(dateStr);
    }

    // For host view, any future date is selectable
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = (year: number, month: number, day: number) => {
    return selectedDates.includes(formatDate(year, month, day));
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getMonthName = (year: number, month: number) => {
    return new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getSelectableCountInMonth = (year: number, month: number) => {
    if (!selectableDates) return 0;
    return selectableDates.filter((dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      return date.getMonth() === month && date.getFullYear() === year;
    }).length;
  };

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

  // Render a single month grid
  const renderMonthGrid = (year: number, month: number, showHeader: boolean = true, headerContent?: React.ReactNode) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    return (
      <div>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            {headerContent || (
              <h3 className="text-lg font-semibold text-[var(--warm-brown)] font-display">
                {getMonthName(year, month)}
              </h3>
            )}
            {selectableDates && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--peach-light)] text-[var(--warm-brown)]">
                {getSelectableCountInMonth(year, month)} date{getSelectableCountInMonth(year, month) !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-[var(--warm-gray-light)] py-1 uppercase tracking-wide"
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
            const selectable = isDateSelectable(year, month, day);
            const selected = isDateSelected(year, month, day);
            const today = isToday(year, month, day);

            return (
              <button
                key={day}
                onClick={() => selectable && onDateToggle(formatDate(year, month, day))}
                disabled={!selectable}
                className={`
                  aspect-square rounded-xl text-sm font-medium transition-all duration-200 relative
                  ${
                    selected
                      ? 'bg-[var(--coral)] text-white shadow-lg shadow-[var(--coral)]/30 scale-105 z-10'
                      : selectable
                      ? selectableDates
                        ? 'bg-[var(--peach-light)] text-[var(--warm-brown)] hover:bg-[var(--peach)] hover:scale-105 border-2 border-[var(--peach)]'
                        : 'hover:bg-[var(--peach-light)] text-[var(--warm-brown)] hover:scale-105'
                      : 'text-[var(--warm-gray-light)]/40 cursor-not-allowed'
                  }
                  ${today && !selected ? 'ring-2 ring-[var(--amber)] ring-offset-1' : ''}
                `}
              >
                {day}
                {selected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--amber)] rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Guest view: Show all months with available dates
  if (monthsToShow && monthsToShow.length > 0) {
    return (
      <div className="card-elevated p-5 sm:p-6">
        <div className={`grid gap-6 ${monthsToShow.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {monthsToShow.map(({ year, month, key }) => (
            <div key={key}>
              {renderMonthGrid(year, month)}
            </div>
          ))}
        </div>

        {/* Selection hint */}
        <div className="text-center mt-5 pt-4 border-t border-[var(--cream-dark)]">
          <p className="text-xs text-[var(--warm-gray)]">
            <span className="inline-block w-3 h-3 bg-[var(--peach-light)] border border-[var(--peach)] rounded mr-1 align-middle" />
            = available dates (tap to select)
          </p>
        </div>
      </div>
    );
  }

  // Host view: Single month with navigation
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
          {getMonthName(currentMonth.getFullYear(), currentMonth.getMonth())}
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

      {renderMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth(), false)}

      {/* Selection hint */}
      <p className="text-center text-xs text-[var(--warm-gray-light)] mt-4">
        Tap dates to select
      </p>
    </div>
  );
}
