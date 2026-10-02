'use client';

import { useState, useEffect } from 'react';
import { getEventWithResponses, TimeSlot } from '@/lib/actions';
import ShareSection from '@/components/ShareSection';
import AvailabilityGrid from '@/components/AvailabilityGrid';
import { SLOT_EMOJI, SLOT_LABEL } from '@/lib/slots';

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

  useEffect(() => {
    let active = true;
    const loadData = () =>
      getEventWithResponses(eventId).then((data) => {
        if (!active) return;
        if (data) {
          setEvent(data.event);
          setResponses(data.responses);
        }
        setIsLoading(false);
      });
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-9 w-2/3 mx-auto rounded-xl bg-[var(--cream-dark)]" />
        <div className="h-5 w-1/3 mx-auto rounded-lg bg-[var(--cream-dark)]" />
        <div className="h-20 rounded-3xl bg-white/70" />
        <div className="h-64 rounded-3xl bg-white/70" />
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

  const plusOnes = responses.filter((r) => r.plus_one).length;
  const total = responses.length + plusOnes;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
      <header className="text-center">
        <h1 className="text-3xl font-display font-bold text-[var(--warm-brown)] break-words">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-sm text-[var(--warm-gray)]">
          {event.location && <span>📍 {event.location}</span>}
          <span>👥 {total} {total === 1 ? 'person' : 'people'}{plusOnes > 0 && ` (incl. ${plusOnes} +1${plusOnes > 1 ? 's' : ''})`}</span>
          <span>{event.time_slots.map((s) => `${SLOT_EMOJI[s]} ${SLOT_LABEL[s]}`).join(' · ')}</span>
        </div>
      </header>

      {responses.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <div className="text-5xl mb-3">🦗</div>
          <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)] mb-1">
            No responses yet
          </h2>
          <p className="text-[var(--warm-gray)] max-w-sm mx-auto">
            Be the first to share your availability!
          </p>
        </div>
      ) : (
        <AvailabilityGrid dates={event.host_dates} timeSlots={event.time_slots} responses={responses} />
      )}

      <ShareSection
        shareUrl={shareUrl}
        eventTitle={event.title}
        eventLocation={event.location}
      />

      <div className="text-center text-xs text-[var(--warm-gray-light)] space-y-1">
        <p>Updates live every 10 seconds</p>
        <p>Built with &lt;3 by Jacky and Christine</p>
      </div>
    </div>
  );
}
