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
    <main className="min-h-screen bg-[var(--cream)] noise-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-peach w-80 h-80 -top-20 -right-20 animate-pulse-soft" />
      <div className="blob blob-coral w-64 h-64 bottom-20 -left-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <ManageContent eventId={eventId} eventTitle={event.title} />
      </div>
    </main>
  );
}
