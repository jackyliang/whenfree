import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ManageShell from './ManageShell';
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

export default async function ManagePage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  return <ManageShell eventId={eventId} eventTitle={event.title} />;
}
