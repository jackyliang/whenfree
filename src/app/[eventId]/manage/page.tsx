import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ManageContent from './ManageContent';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function ManagePage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <ManageContent eventId={eventId} eventTitle={event.title} />
      </div>
    </main>
  );
}
