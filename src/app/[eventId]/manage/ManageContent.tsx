'use client';

import { useState, useEffect, useCallback } from 'react';
import { verifyAdminCode, getEventWithResponses, TimeSlot } from '@/lib/actions';

interface ManageContentProps {
  eventId: string;
  eventTitle: string;
}

interface ResponseData {
  name: string;
  availability: Record<string, TimeSlot[]>;
}

interface EventData {
  title: string;
  location: string | null;
  description: string | null;
  host_dates: string[];
  time_slots: TimeSlot[];
}

export default function ManageContent({ eventId, eventTitle }: ManageContentProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<EventData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    const data = await getEventWithResponses(eventId);
    if (data) {
      setEvent(data.event);
      setResponses(data.responses);
    }
  }, [eventId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadData]);

  const handleVerify = async () => {
    if (adminCode.length !== 4) return;

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyAdminCode(eventId, adminCode);
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsVerifying(false);
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

  const generateSummary = () => {
    if (!event || responses.length === 0) return '';

    const lines: string[] = [`📅 ${eventTitle} - Availability Summary\n`];

    // Sort dates
    const sortedDates = [...event.host_dates].sort();

    // For each date, show who's available
    for (const date of sortedDates) {
      const available = responses.filter(
        (r) => r.availability[date] && r.availability[date].length > 0
      );

      if (available.length === 0) continue;

      lines.push(`\n${formatDate(date)}:`);
      for (const r of available) {
        const slots = r.availability[date]
          .map((s) => `${getSlotEmoji(s)} ${getSlotLabel(s)}`)
          .join(', ');
        lines.push(`  • ${r.name}: ${slots}`);
      }
    }

    // Find best dates
    const dateCounts: Record<string, number> = {};
    for (const date of sortedDates) {
      dateCounts[date] = responses.filter(
        (r) => r.availability[date] && r.availability[date].length > 0
      ).length;
    }

    const maxCount = Math.max(...Object.values(dateCounts));
    if (maxCount > 0) {
      const bestDates = sortedDates.filter((d) => dateCounts[d] === maxCount);
      lines.push(
        `\n✨ Best date${bestDates.length > 1 ? 's' : ''}: ${bestDates
          .map(formatDate)
          .join(', ')} (${maxCount}/${responses.length} available)`
      );
    }

    return lines.join('\n');
  };

  const handleCopySummary = async () => {
    const summary = generateSummary();
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = summary;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Manage Event
          </h1>
          <p className="text-gray-600">{eventTitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Enter your admin code
          </h2>
          <p className="text-gray-500 text-sm mb-6 text-center">
            The 4-digit code you set when creating this event
          </p>

          <div className="flex justify-center gap-3 mb-6">
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
                  if (e.key === 'Enter' && adminCode.length === 4) {
                    handleVerify();
                  }
                }}
                className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={adminCode.length !== 4 || isVerifying}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
              adminCode.length === 4 && !isVerifying
                ? 'bg-indigo-500 hover:bg-indigo-600 shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isVerifying ? 'Verifying...' : 'View Responses'}
          </button>
        </div>
      </div>
    );
  }

  // Authenticated view - show results
  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const sortedDates = [...event.host_dates].sort();

  // Calculate availability matrix
  const availabilityMatrix: Record<string, Record<string, TimeSlot[]>> = {};
  for (const r of responses) {
    availabilityMatrix[r.name] = r.availability;
  }

  // Find best dates (most people available)
  const dateCounts: Record<string, number> = {};
  for (const date of sortedDates) {
    dateCounts[date] = responses.filter(
      (r) => r.availability[date] && r.availability[date].length > 0
    ).length;
  }
  const maxCount = Math.max(...Object.values(dateCounts), 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
        {event.location && <p className="text-gray-500">{event.location}</p>}
        <p className="text-indigo-600 font-medium mt-2">
          {responses.length} response{responses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {responses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No responses yet
          </h2>
          <p className="text-gray-500">
            Share your event link with friends to start collecting availability
          </p>
        </div>
      ) : (
        <>
          {/* Availability Grid */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 sticky left-0 bg-white">
                      Name
                    </th>
                    {sortedDates.map((date) => (
                      <th
                        key={date}
                        className={`px-4 py-3 text-center text-sm font-medium whitespace-nowrap ${
                          dateCounts[date] === maxCount && maxCount > 0
                            ? 'text-green-700 bg-green-50'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatDate(date)}
                        {dateCounts[date] === maxCount && maxCount > 0 && (
                          <span className="ml-1">⭐</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, idx) => (
                    <tr
                      key={r.name}
                      className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 sticky left-0 bg-inherit">
                        {r.name}
                      </td>
                      {sortedDates.map((date) => {
                        const slots = r.availability[date] || [];
                        return (
                          <td key={date} className="px-4 py-3 text-center">
                            {slots.length > 0 ? (
                              <span className="text-lg" title={slots.map(getSlotLabel).join(', ')}>
                                {slots.map((s) => getSlotEmoji(s)).join('')}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50">
                      Total
                    </td>
                    {sortedDates.map((date) => (
                      <td
                        key={date}
                        className={`px-4 py-3 text-center text-sm font-semibold ${
                          dateCounts[date] === maxCount && maxCount > 0
                            ? 'text-green-700'
                            : 'text-gray-600'
                        }`}
                      >
                        {dateCounts[date]}/{responses.length}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-600 font-medium mb-2">Legend:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {event.time_slots.map((slot) => (
                <span key={slot} className="flex items-center gap-1">
                  <span>{getSlotEmoji(slot)}</span>
                  <span className="text-gray-600">{getSlotLabel(slot)}</span>
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span>⭐</span>
                <span className="text-gray-600">Best date(s)</span>
              </span>
            </div>
          </div>

          {/* Copy Summary Button */}
          <button
            onClick={handleCopySummary}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg'
            }`}
          >
            {copied ? 'Copied to clipboard!' : 'Copy Summary for Group Chat'}
          </button>
        </>
      )}
    </div>
  );
}
