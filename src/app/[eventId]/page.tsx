import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ParticipantForm from './ParticipantForm';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  const timeSlotEmojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    allday: '🎉',
  };

  const timeSlotLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    allday: 'All Day',
  };

  return (
    <main className="min-h-screen bg-[var(--cream)] noise-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-coral w-72 h-72 -top-20 -left-20 animate-pulse-soft" />
      <div className="blob blob-peach w-80 h-80 bottom-20 -right-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-12">
        {/* Event header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-block mb-4">
            <span className="text-4xl">🗓️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--warm-brown)] mb-3">
            {event.title}
          </h1>
          {event.location && (
            <p className="text-[var(--warm-gray)] text-lg mb-2 flex items-center justify-center gap-2">
              <span>📍</span> {event.location}
            </p>
          )}
          {event.description && (
            <p className="text-[var(--warm-gray-light)] mb-4 max-w-md mx-auto">
              {event.description}
            </p>
          )}

          {/* Time slots badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--peach-light)] border border-[var(--peach)]">
            {event.time_slots.map((slot) => (
              <span key={slot} className="flex items-center gap-1 text-sm text-[var(--warm-brown)]">
                <span>{timeSlotEmojis[slot]}</span>
                <span className="font-medium">{timeSlotLabels[slot]}</span>
              </span>
            ))}
          </div>
        </div>

        <ParticipantForm
          eventId={eventId}
          hostDates={event.host_dates}
          timeSlots={event.time_slots}
        />

        {/* Footer */}
        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-10">
          Powered by <span className="font-semibold">WhenFree</span> 💛
        </p>
      </div>
    </main>
  );
}
