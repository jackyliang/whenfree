import { getEvent, verifyAdminCode } from '@/lib/actions';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import ManageShell from '../ManageShell';

interface Props {
  params: Promise<{ eventId: string; code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  return {
    title: event ? `${event.title} | WhenFree` : 'Event Not Found | WhenFree',
  };
}

export default async function ManageWithCodePage({ params }: Props) {
  const { eventId, code } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  if (!/^\d{4}$/.test(code) || !(await verifyAdminCode(eventId, code))) {
    redirect(`/${eventId}/manage`);
  }

  return <ManageShell eventId={eventId} eventTitle={event.title} initialCode={code} />;
}
