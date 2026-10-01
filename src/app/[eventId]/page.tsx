import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ParticipantForm from './ParticipantForm';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  return {
    title: event ? `${event.title} | WhenFree` : 'Event Not Found | WhenFree',
  };
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

  // Format dates nicely for display
  const sortedDates = [...event.host_dates].sort();
  const formatDateRange = () => {
    if (sortedDates.length === 0) return '';
    const first = new Date(sortedDates[0] + 'T00:00:00');
    const last = new Date(sortedDates[sortedDates.length - 1] + 'T00:00:00');

    if (sortedDates.length === 1) {
      return first.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    const sameMonth = first.getMonth() === last.getMonth();
    if (sameMonth) {
      return `${first.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${last.getDate()}, ${first.getFullYear()}`;
    }
    return `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <main className="min-h-dvh relative overflow-x-clip bg-gradient-to-b from-[#FFF4EA] via-[var(--cream)] to-[var(--cream)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 overflow-hidden">
        <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-[var(--coral)]/15 blur-3xl" />
        <div className="absolute -top-20 -left-24 w-72 h-72 rounded-full bg-[var(--amber)]/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 pb-6 sm:py-12">
        <section className="text-center mb-6 animate-slide-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[var(--coral)]/15 text-xs font-semibold uppercase tracking-wider text-[var(--coral)] mb-4">
            💌 You&apos;re invited
          </span>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--warm-brown)] leading-tight break-words">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-sm text-[var(--warm-gray)]">
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <span>📍</span>
                <span className="font-medium">{event.location}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <span>📅</span>
              <span className="font-medium">{formatDateRange()}</span>
            </span>
          </div>

          {event.description && (
            <p className="text-[var(--warm-gray)] mt-3 max-w-md mx-auto leading-relaxed break-words">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {event.time_slots.map((slot) => (
              <span
                key={slot}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-sm font-medium text-[var(--warm-brown)] border border-[var(--peach)]"
              >
                <span>{timeSlotEmojis[slot]}</span>
                <span>{timeSlotLabels[slot]}</span>
              </span>
            ))}
          </div>
        </section>

        <div className="animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <ParticipantForm
            eventId={eventId}
            hostDates={event.host_dates}
            timeSlots={event.time_slots}
          />
        </div>

        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-8">
          Built with &lt;3 by Jacky and Christine
        </p>
      </div>
    </main>
  );
}
