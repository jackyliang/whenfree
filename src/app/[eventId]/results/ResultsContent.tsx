'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEventWithResponses, TimeSlot } from '@/lib/actions';
import ShareSection from '@/components/ShareSection';

interface ResultsContentProps {
  eventId: string;
  shareUrl: string;
}

interface ResponseData {
  name: string;
  availability: Record<string, TimeSlot[]>;
  plus_one: string | null;
}

interface EventData {
  title: string;
  location: string | null;
  description: string | null;
  host_dates: string[];
  time_slots: TimeSlot[];
}

export default function ResultsContent({ eventId, shareUrl }: ResultsContentProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await getEventWithResponses(eventId);
    if (data) {
      setEvent(data.event);
      setResponses(data.responses);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSlotEmoji = (slot: TimeSlot) => {
    const emojis: Record<TimeSlot, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      allday: '🎉',
    };
    return emojis[slot];
  };

  const getSlotLabel = (slot: TimeSlot) => {
    const labels: Record<TimeSlot, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      allday: 'All Day',
    };
    return labels[slot];
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
        <p className="text-[var(--warm-gray)]">Loading results...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-[var(--warm-gray)]">Event not found</p>
      </div>
    );
  }

  const sortedDates = [...event.host_dates].sort();

  const dateCounts: Record<string, number> = {};
  for (const date of sortedDates) {
    dateCounts[date] = responses.filter(
      (r) => r.availability[date] && r.availability[date].length > 0
    ).length;
  }
  const maxCount = Math.max(...Object.values(dateCounts), 0);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-4xl mb-4 block">📊</span>
        <h1 className="text-3xl font-display font-bold text-[var(--warm-brown)] mb-2">
          {event.title}
        </h1>
        {event.location && (
          <p className="text-[var(--warm-gray)] flex items-center justify-center gap-2">
            <span>📍</span> {event.location}
          </p>
        )}
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[var(--peach-light)] border border-[var(--peach)]">
          <span className="text-lg">👥</span>
          <span className="font-semibold text-[var(--warm-brown)]">
            {responses.length + responses.filter(r => r.plus_one).length} guest{(responses.length + responses.filter(r => r.plus_one).length) !== 1 ? 's' : ''}
            {responses.filter(r => r.plus_one).length > 0 && (
              <span className="text-[var(--warm-gray)] font-normal ml-1">
                ({responses.length} + {responses.filter(r => r.plus_one).length} +1s)
              </span>
            )}
          </span>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <div className="text-5xl mb-4">🦗</div>
          <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)] mb-2">
            No responses yet
          </h2>
          <p className="text-[var(--warm-gray)] max-w-sm mx-auto">
            Be the first to share your availability!
          </p>
        </div>
      ) : (
        <>
          {/* Availability Grid */}
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--cream-dark)]">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--warm-brown)] sticky left-0 bg-white z-10">
                      Name
                    </th>
                    {sortedDates.map((date) => (
                      <th
                        key={date}
                        className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
                          dateCounts[date] === maxCount && maxCount > 0
                            ? 'text-[var(--sage-dark)] bg-[var(--sage)]/10'
                            : 'text-[var(--warm-gray)]'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{formatDate(date)}</span>
                          {dateCounts[date] === maxCount && maxCount > 0 && (
                            <span className="text-xs bg-[var(--sage)] text-white px-2 py-0.5 rounded-full">
                              Best!
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, idx) => (
                    <tr
                      key={r.name}
                      className={`border-b border-[var(--cream-dark)] last:border-0 ${
                        idx % 2 === 0 ? 'bg-[var(--cream)]/50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-4 text-sm font-medium text-[var(--warm-brown)] sticky left-0 bg-inherit z-10">
                        {r.name}
                        {r.plus_one && (
                          <span className="ml-1 text-xs text-[var(--warm-gray)]">+1 {r.plus_one}</span>
                        )}
                      </td>
                      {sortedDates.map((date) => {
                        const slots = r.availability[date] || [];
                        const isBestDate = dateCounts[date] === maxCount && maxCount > 0;
                        return (
                          <td
                            key={date}
                            className={`px-4 py-4 text-center ${isBestDate ? 'bg-[var(--sage)]/10' : ''}`}
                          >
                            {slots.length > 0 ? (
                              <span className="text-xl" title={slots.map(getSlotLabel).join(', ')}>
                                {slots.map((s) => getSlotEmoji(s)).join('')}
                              </span>
                            ) : (
                              <span className="text-[var(--warm-gray-light)]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--cream-dark)]">
                    <td className="px-4 py-4 text-sm font-bold text-[var(--warm-brown)] sticky left-0 bg-[var(--cream-dark)] z-10">
                      Total
                    </td>
                    {sortedDates.map((date) => {
                      const isBestDate = dateCounts[date] === maxCount && maxCount > 0;
                      return (
                        <td
                          key={date}
                          className={`px-4 py-4 text-center text-sm font-bold ${
                            isBestDate
                              ? 'text-[var(--sage-dark)] bg-[var(--sage)]/20'
                              : 'text-[var(--warm-gray)]'
                          }`}
                        >
                          {dateCounts[date]}/{responses.length}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="card p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-[var(--warm-gray)]">Legend:</span>
              {event.time_slots.map((slot) => (
                <span key={slot} className="flex items-center gap-1.5">
                  <span className="text-lg">{getSlotEmoji(slot)}</span>
                  <span className="text-[var(--warm-brown)]">{getSlotLabel(slot)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Share section */}
          <ShareSection
            shareUrl={shareUrl}
            eventTitle={event.title}
            eventLocation={event.location}
          />
        </>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-[var(--warm-gray-light)] space-y-1">
        <p>Auto-refreshes every 10 seconds</p>
        <p>Built with &lt;3 by Jacky and Christine</p>
      </div>
    </div>
  );
}
