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

  const timeSlotLabels: Record<string, string> = {
    breakfast: 'Breakfast (8-11am)',
    lunch: 'Lunch (11am-2pm)',
    dinner: 'Dinner (6-9pm)',
    allday: 'All Day',
  };

  const formattedTimeSlots = event.time_slots
    .map((slot) => timeSlotLabels[slot] || slot)
    .join(', ');

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {event.title}
          </h1>
          {event.location && (
            <p className="text-gray-500 text-lg mb-2">
              {event.location}
            </p>
          )}
          {event.description && (
            <p className="text-gray-600 mb-4">
              {event.description}
            </p>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
            <span>{formattedTimeSlots}</span>
          </div>
        </div>

        <ParticipantForm
          eventId={eventId}
          hostDates={event.host_dates}
          timeSlots={event.time_slots}
        />
      </div>
    </main>
  );
}
