import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ResultsContent from './ResultsContent';
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

export default async function ResultsPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfree.vercel.app'}/${eventId}`;

  return (
    <main className="min-h-screen bg-[var(--cream)] noise-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-sage w-80 h-80 -top-20 -right-20 animate-pulse-soft" style={{ background: 'var(--sage)' }} />
      <div className="blob blob-peach w-72 h-72 bottom-20 -left-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <ResultsContent eventId={eventId} shareUrl={shareUrl} />
      </div>
    </main>
  );
}
