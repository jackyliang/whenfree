import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CopyButton from './CopyButton';
import ShareSection from '@/components/ShareSection';
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

export default async function CreatedPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfree.vercel.app'}/${eventId}`;
  const manageUrl = `${shareUrl}/manage`;

  return (
    <main className="min-h-dvh bg-[var(--cream)] noise-bg relative overflow-x-clip">
      <div className="blob w-80 h-80 -top-24 -right-24 animate-pulse-soft" style={{ background: 'var(--sage)' }} />
      <div className="blob blob-peach w-72 h-72 bottom-20 -left-24 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-8 pb-8 sm:py-16">
        <header className="text-center mb-6 sm:mb-10 animate-fadeInUp">
          <span className="text-5xl block mb-2">🎉</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--warm-brown)]">
            You&apos;re all set!
          </h1>
          <p className="text-[var(--warm-gray)] mt-1">
            <span className="font-semibold text-[var(--warm-brown)]">{event.title}</span>
            {event.location && <> · {event.location}</>}
          </p>
        </header>

        <div className="space-y-4 sm:space-y-6 animate-fadeInUp stagger-1">
          <ShareSection
            shareUrl={shareUrl}
            eventTitle={event.title}
            eventLocation={event.location}
          />

          <div className="card-elevated p-5 sm:p-6">
            <h2 className="text-base font-display font-semibold text-[var(--warm-brown)]">
              🔐 Your admin link
            </h2>
            <p className="text-xs text-[var(--warm-gray)] mt-0.5 mb-3">
              Save this! Open it with your 4-digit code to see who&apos;s free.
            </p>
            <div className="flex items-center gap-2 p-1.5 pl-4 rounded-2xl bg-[var(--cream)] border-2 border-[var(--cream-dark)]">
              <span className="flex-1 min-w-0 truncate font-mono text-sm text-[var(--warm-brown)]">
                {manageUrl.replace(/^https?:\/\//, '')}
              </span>
              <CopyButton text={manageUrl} />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Link href={`/${eventId}`} className="btn-secondary flex-1 text-center">
              Preview invite
            </Link>
            <Link href={`/${eventId}/manage`} className="btn-primary flex-1 text-center">
              View responses →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-10 sm:mt-12">
          Built with &lt;3 by Jacky and Christine
        </p>
      </div>
    </main>
  );
}
