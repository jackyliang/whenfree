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
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FFFCF5] to-[#FFF0E5] animate-gradient" />

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--coral)]/20 to-[var(--amber)]/10 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[var(--peach)]/30 to-[var(--coral)]/10 blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[var(--amber)]/15 to-transparent blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-8 sm:py-12">
        {/* You're Invited Badge */}
        <div className="animate-slide-up mb-6" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-[var(--coral)]">
            <span className="animate-bounce-subtle">✨</span>
            <span>You&apos;re Invited</span>
            <span className="animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>✨</span>
          </div>
        </div>

        {/* Main Invitation Card */}
        <div className="w-full max-w-xl animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <div className="relative">
            {/* Glowing border effect */}
            <div className="invitation-glow" />

            {/* Card */}
            <div className="invitation-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              {/* Decorative corner flourishes */}
              <div className="absolute top-0 left-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--coral)]">
                  <path d="M0,0 Q50,0 50,50 Q50,0 100,0" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="25" cy="25" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 rotate-180">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--coral)]">
                  <path d="M0,0 Q50,0 50,50 Q50,0 100,0" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="25" cy="25" r="3" fill="currentColor"/>
                </svg>
              </div>

              {/* Event Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--coral)]/10 to-[var(--amber)]/10 mb-4 animate-glow">
                  <span className="text-4xl">🎊</span>
                </div>
              </div>

              {/* Event Title */}
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-center text-[var(--warm-brown)] mb-3 leading-tight">
                {event.title}
              </h1>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                {event.location && (
                  <div className="flex items-center justify-center gap-2 text-[var(--warm-gray)]">
                    <span className="text-lg">📍</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-[var(--warm-gray)]">
                  <span className="text-lg">📅</span>
                  <span className="font-medium">{formatDateRange()}</span>
                </div>

                {event.description && (
                  <p className="text-center text-[var(--warm-gray-light)] mt-4 max-w-md mx-auto leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Time Slots */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                {event.time_slots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--peach-light)] to-[var(--cream)] text-sm font-medium text-[var(--warm-brown)] border border-[var(--peach)]/50"
                  >
                    <span>{timeSlotEmojis[slot]}</span>
                    <span>{timeSlotLabels[slot]}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider with text */}
        <div className="w-full max-w-xl flex items-center gap-4 my-8 px-4 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--coral)]/20 to-transparent" />
          <span className="text-sm font-medium text-[var(--warm-gray-light)]">Share your availability</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--coral)]/20 to-transparent" />
        </div>

        {/* Participant Form */}
        <div className="w-full max-w-xl animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <ParticipantForm
            eventId={eventId}
            hostDates={event.host_dates}
            timeSlots={event.time_slots}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-10 animate-slide-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          Built with &lt;3 by Jacky and Christine
        </p>
      </div>
    </main>
  );
}
