'use client';

import { useState, useEffect, useCallback } from 'react';
import { verifyAdminCode, getEventWithResponses, updateEvent, deleteResponse, TimeSlot } from '@/lib/actions';

interface ManageContentProps {
  eventId: string;
  eventTitle: string;
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

export default function ManageContent({ eventId, eventTitle }: ManageContentProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<EventData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [copied, setCopied] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const interval = setInterval(loadData, 10000);
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
        setError('Wrong code. Try again!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
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
    const sortedDates = [...event.host_dates].sort();

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

  const startEditing = () => {
    if (!event) return;
    setEditTitle(event.title);
    setEditLocation(event.location || '');
    setEditDescription(event.description || '');
    setSaveError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError('');
  };

  const handleSaveEvent = async () => {
    if (!editTitle.trim()) {
      setSaveError('Title is required');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const result = await updateEvent({
        eventId,
        adminCode,
        title: editTitle.trim(),
        location: editLocation.trim() || null,
        description: editDescription.trim() || null,
      });

      if (result.success) {
        setIsEditing(false);
        loadData();
      } else {
        setSaveError(result.error || 'Failed to save');
      }
    } catch {
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResponse = async (name: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteResponse({
        eventId,
        adminCode,
        responseName: name,
      });

      if (result.success) {
        setDeleteConfirm(null);
        loadData();
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete response');
    } finally {
      setIsDeleting(false);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto animate-fadeInUp">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🔐</span>
          <h1 className="text-3xl font-display font-bold text-[var(--warm-brown)] mb-2">
            Manage Event
          </h1>
          <p className="text-[var(--warm-gray)]">{eventTitle}</p>
        </div>

        <div className="card-elevated p-6 sm:p-8">
          <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)] mb-2 text-center">
            Enter your secret code
          </h2>
          <p className="text-[var(--warm-gray)] text-sm mb-6 text-center">
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
                autoFocus={i === 0}
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
                    const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                    if (prev) {
                      prev.focus();
                      setAdminCode((c) => c.slice(0, -1));
                    }
                  }
                  if (e.key === 'Enter' && adminCode.length === 4) {
                    handleVerify();
                  }
                }}
                className="w-16 h-20 text-center text-3xl font-bold rounded-2xl border-2 border-[var(--warm-gray-light)]/20 bg-[var(--cream-dark)] focus:border-[var(--coral)] focus:ring-4 focus:ring-[var(--coral)]/10 outline-none transition-all"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={adminCode.length !== 4 || isVerifying}
            className={`btn-primary w-full ${(adminCode.length !== 4 || isVerifying) && 'opacity-50 cursor-not-allowed'}`}
          >
            {isVerifying ? 'Checking...' : 'View Responses'}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!event) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
        <p className="text-[var(--warm-gray)]">Loading responses...</p>
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

        {isEditing ? (
          <div className="card-elevated p-6 max-w-md mx-auto text-left space-y-4">
            <h2 className="text-lg font-display font-semibold text-[var(--warm-brown)] text-center mb-4">
              Edit Event Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-[var(--warm-brown)] mb-1">
                Event Name *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-warm"
                placeholder="Event name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--warm-brown)] mb-1">
                Location
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="input-warm"
                placeholder="Where is this happening?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--warm-brown)] mb-1">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="input-warm min-h-[80px] resize-none"
                placeholder="Any additional details..."
              />
            </div>

            {saveError && (
              <div className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-xl">
                {saveError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={isSaving}
                className="flex-1 btn-primary"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-display font-bold text-[var(--warm-brown)] mb-2">
              {event.title}
            </h1>
            {event.location && (
              <p className="text-[var(--warm-gray)] flex items-center justify-center gap-2">
                <span>📍</span> {event.location}
              </p>
            )}
            {event.description && (
              <p className="text-[var(--warm-gray-light)] text-sm mt-2 max-w-md mx-auto">
                {event.description}
              </p>
            )}
            <button
              onClick={startEditing}
              className="mt-3 text-sm text-[var(--coral)] hover:underline font-medium"
            >
              Edit event details
            </button>
          </>
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
            Share your event link with friends to start collecting availability!
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
                    <th className="px-4 py-4 text-center text-sm font-medium text-[var(--warm-gray)] w-16">

                    </th>
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
                      <td className="px-4 py-4 text-center">
                        {deleteConfirm === r.name ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteResponse(r.name)}
                              disabled={isDeleting}
                              className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              {isDeleting ? '...' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={isDeleting}
                              className="text-xs px-2 py-1 rounded bg-[var(--cream-dark)] text-[var(--warm-gray)] hover:bg-[var(--cream)]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(r.name)}
                            className="text-[var(--warm-gray-light)] hover:text-red-500 transition-colors"
                            title="Delete response"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
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
                    <td className="px-4 py-4"></td>
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

          {/* Copy Summary Button */}
          <button
            onClick={handleCopySummary}
            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-200 ${
              copied
                ? 'bg-[var(--sage)] text-white'
                : 'btn-primary'
            }`}
          >
            {copied ? '✓ Copied to clipboard!' : 'Copy Summary for Group Chat 📋'}
          </button>
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
