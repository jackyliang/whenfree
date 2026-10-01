'use client';

import type { ReactNode } from 'react';
import type { TimeSlot } from '@/lib/actions';
import { SLOT_EMOJI, SLOT_LABEL, formatShortDate } from '@/lib/slots';

interface GridResponse {
  name: string;
  availability: Record<string, TimeSlot[]>;
  plus_one: string | null;
}

interface AvailabilityGridProps {
  dates: string[];
  timeSlots: TimeSlot[];
  responses: GridResponse[];
  renderNameAction?: (response: GridResponse) => ReactNode;
}

export function getDateCounts(dates: string[], responses: GridResponse[]) {
  const counts: Record<string, number> = {};
  for (const date of dates) {
    counts[date] = responses.filter((r) => r.availability[date]?.length > 0).length;
  }
  return counts;
}

export default function AvailabilityGrid({ dates, timeSlots, responses, renderNameAction }: AvailabilityGridProps) {
  const sortedDates = [...dates].sort();
  const counts = getDateCounts(sortedDates, responses);
  const maxCount = Math.max(...Object.values(counts), 0);
  const bestDates = maxCount > 0 ? sortedDates.filter((d) => counts[d] === maxCount) : [];
  const isBest = (d: string) => maxCount > 0 && counts[d] === maxCount;

  return (
    <div className="space-y-3">
      {bestDates.length > 0 && (
        <div className="card-elevated p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 shrink-0 rounded-2xl bg-[var(--sage)]/25 flex items-center justify-center text-2xl">🏆</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sage-dark)]">
              Best {bestDates.length > 1 ? 'dates' : 'date'}
            </p>
            <p className="font-display font-semibold text-[var(--warm-brown)] leading-snug">
              {bestDates.map(formatShortDate).join(' · ')}
            </p>
            <p className="text-sm text-[var(--warm-gray)]">
              {maxCount} of {responses.length} can make it
            </p>
          </div>
        </div>
      )}

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-white px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--warm-gray-light)] border-b border-[var(--cream-dark)] min-w-[7.5rem]">
                  Who
                </th>
                {sortedDates.map((date) => {
                  const d = new Date(date + 'T00:00:00');
                  return (
                    <th
                      key={date}
                      className={`px-1.5 py-3 text-center font-medium border-b border-[var(--cream-dark)] min-w-[3.25rem] ${
                        isBest(date) ? 'bg-[var(--sage)]/15 text-[var(--sage-dark)]' : 'text-[var(--warm-gray)]'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider leading-none">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-display font-semibold leading-tight text-[var(--warm-brown)]">
                        {d.getDate()}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider leading-none">
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.name}>
                  <td className="sticky left-0 z-10 bg-white px-3 sm:px-4 py-2.5 border-b border-[var(--cream-dark)] max-w-[9rem]">
                    <div className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[var(--warm-brown)] break-words leading-tight">{r.name}</div>
                        {r.plus_one && (
                          <div className="text-xs text-[var(--warm-gray)] break-words leading-tight">+1 {r.plus_one}</div>
                        )}
                      </div>
                      {renderNameAction?.(r)}
                    </div>
                  </td>
                  {sortedDates.map((date) => {
                    const slots = r.availability[date] || [];
                    const partial = slots.length > 0 && slots.length < timeSlots.length;
                    return (
                      <td
                        key={date}
                        className={`px-1.5 py-2.5 text-center border-b border-[var(--cream-dark)] ${isBest(date) ? 'bg-[var(--sage)]/15' : ''}`}
                        title={slots.map((s) => SLOT_LABEL[s]).join(', ')}
                      >
                        {slots.length === 0 ? (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--warm-gray-light)]/30" aria-label="Not free" />
                        ) : partial ? (
                          <span className="text-base leading-none">{slots.map((s) => SLOT_EMOJI[s]).join('')}</span>
                        ) : (
                          <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-[var(--coral)] text-white" aria-label="Free">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="sticky left-0 z-10 bg-[var(--cream-dark)] px-3 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--warm-gray)]">
                  Free
                </td>
                {sortedDates.map((date) => (
                  <td
                    key={date}
                    className={`px-1.5 py-3 text-center text-sm font-bold ${
                      isBest(date) ? 'bg-[var(--sage)]/30 text-[var(--sage-dark)]' : 'bg-[var(--cream-dark)] text-[var(--warm-gray)]'
                    }`}
                  >
                    {counts[date]}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {sortedDates.length > 4 && (
        <p className="text-center text-xs text-[var(--warm-gray-light)] sm:hidden">Swipe the grid to see every date →</p>
      )}
    </div>
  );
}
