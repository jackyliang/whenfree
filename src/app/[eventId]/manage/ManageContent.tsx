'use client';

import { useState, useEffect, useCallback } from 'react';
import { verifyAdminCode, getEventWithResponses, updateEvent, deleteResponse, TimeSlot } from '@/lib/actions';
import CodeInput from '@/components/CodeInput';
import AvailabilityGrid from '@/components/AvailabilityGrid';
import { SLOT_EMOJI, SLOT_LABEL } from '@/lib/slots';

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
  const [deleteError, setDeleteError] = useState('');

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
    if (adminCode.length !== 4 || isVerifying) return;

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyAdminCode(eventId, adminCode);
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setError('Wrong code. Try again!');
        setAdminCode('');
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
    setDeleteError('');
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
        setDeleteError(result.error || 'Failed to delete');
      }
    } catch {
      setDeleteError('Failed to delete response');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto animate-fadeInUp">
        <header className="text-center mb-6">
          <span className="text-4xl mb-2 block">🔐</span>
          <h1 className="text-3xl font-display font-bold text-[var(--warm-brown)]">Manage event</h1>
          <p className="text-[var(--warm-gray)] mt-1 break-words">{eventTitle}</p>
        </header>

        <form
          className="card-elevated p-6 sm:p-8 text-center"
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
        >
          <h2 className="text-lg font-display font-semibold text-[var(--warm-brown)] mb-1">
            Enter your secret code
          </h2>
          <p className="text-[var(--warm-gray)] text-sm mb-5">
            The 4 digits you set when creating this event
          </p>

          <CodeInput
            value={adminCode}
            onChange={(c) => {
              setAdminCode(c);
              if (error) setError('');
            }}
            onComplete={handleVerify}
            invalid={!!error}
            autoFocus
          />

          <p role="alert" className="h-5 mt-3 text-sm font-medium text-[var(--coral-dark)]">
            {error}
          </p>

          <button type="submit" disabled={adminCode.length !== 4 || isVerifying} className="btn-primary w-full mt-3">
            {isVerifying ? 'Checking...' : 'View responses'}
          </button>
        </form>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-9 w-2/3 mx-auto rounded-xl bg-[var(--cream-dark)]" />
        <div className="h-5 w-1/3 mx-auto rounded-lg bg-[var(--cream-dark)]" />
        <div className="h-20 rounded-3xl bg-white/70" />
        <div className="h-64 rounded-3xl bg-white/70" />
      </div>
    );
  }

  const plusOnes = responses.filter((r) => r.plus_one).length;
  const total = responses.length + plusOnes;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
      {isEditing ? (
        <form
          className="card-elevated p-5 sm:p-6 max-w-md mx-auto space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEvent();
          }}
        >
          <h2 className="text-lg font-display font-semibold text-[var(--warm-brown)]">Edit details</h2>

          <div>
            <label htmlFor="edit-title" className="block text-sm font-semibold text-[var(--warm-brown)] mb-1.5">Name</label>
            <input id="edit-title" type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-warm" placeholder="Event name" />
          </div>
          <div>
            <label htmlFor="edit-location" className="block text-sm font-semibold text-[var(--warm-brown)] mb-1.5">
              Location <span className="font-normal text-[var(--warm-gray-light)]">(optional)</span>
            </label>
            <input id="edit-location" type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="input-warm" placeholder="Where is this happening?" />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm font-semibold text-[var(--warm-brown)] mb-1.5">
              Details <span className="font-normal text-[var(--warm-gray-light)]">(optional)</span>
            </label>
            <textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="input-warm resize-none" placeholder="Any additional details..." />
          </div>

          {saveError && (
            <p role="alert" className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-xl">{saveError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={cancelEditing} disabled={isSaving} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 btn-primary">{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      ) : (
        <header className="text-center">
          <h1 className="text-3xl font-display font-bold text-[var(--warm-brown)] break-words">{event.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-sm text-[var(--warm-gray)]">
            {event.location && <span>📍 {event.location}</span>}
            <span>👥 {total} {total === 1 ? 'person' : 'people'}{plusOnes > 0 && ` (incl. ${plusOnes} +1${plusOnes > 1 ? 's' : ''})`}</span>
            <span>{event.time_slots.map((s) => `${SLOT_EMOJI[s]} ${SLOT_LABEL[s]}`).join(' · ')}</span>
          </div>
          {event.description && (
            <p className="text-[var(--warm-gray)] text-sm mt-2 max-w-md mx-auto break-words">{event.description}</p>
          )}
          <button onClick={startEditing} className="mt-2 px-3 py-2 text-sm text-[var(--coral)] font-semibold">
            ✏️ Edit details
          </button>
        </header>
      )}

      {responses.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <div className="text-5xl mb-3">🦗</div>
          <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)] mb-1">No responses yet</h2>
          <p className="text-[var(--warm-gray)] max-w-sm mx-auto">
            Share your event link with friends to start collecting availability!
          </p>
        </div>
      ) : (
        <>
          <AvailabilityGrid
            dates={event.host_dates}
            timeSlots={event.time_slots}
            responses={responses}
            renderNameAction={(r) => (
              <button
                onClick={() => {
                  setDeleteError('');
                  setDeleteConfirm(r.name);
                }}
                className="shrink-0 -mr-1.5 w-8 h-8 flex items-center justify-center rounded-full text-[var(--warm-gray-light)] active:bg-red-50 [@media(hover:hover)]:hover:text-red-500"
                aria-label={`Remove ${r.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          />

          <div className="action-bar">
            <button
              onClick={handleCopySummary}
              className={`w-full ${copied ? 'btn-primary !bg-[var(--sage-dark)]' : 'btn-primary'}`}
            >
              {copied ? '✓ Copied to clipboard!' : 'Copy summary for group chat 📋'}
            </button>
          </div>
        </>
      )}

      <div className="text-center text-xs text-[var(--warm-gray-light)] space-y-1">
        <p>Updates live every 10 seconds</p>
        <p>Built with &lt;3 by Jacky and Christine</p>
      </div>

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--warm-brown)]/30 backdrop-blur-[2px]"
          onClick={() => !isDeleting && setDeleteConfirm(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 animate-sheet-up sm:animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-display font-semibold text-[var(--warm-brown)]">
              Remove {deleteConfirm}&apos;s response?
            </h3>
            <p className="text-sm text-[var(--warm-gray)] mt-1 mb-5">They can always fill it out again.</p>
            {deleteError && (
              <p role="alert" className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-xl mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={isDeleting} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteResponse(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 btn-primary !bg-[var(--coral-dark)] !shadow-none"
              >
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
