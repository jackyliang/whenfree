import { getEvent } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CopyButton from './CopyButton';

interface Props {
  params: Promise<{ eventId: string }>;
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
    <main className="min-h-screen bg-[var(--cream)] noise-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-sage w-80 h-80 -top-20 -right-20 animate-pulse-soft" style={{ background: 'var(--sage)' }} />
      <div className="blob blob-peach w-72 h-72 bottom-20 -left-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="inline-block mb-4">
            <span className="text-6xl">🎉</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--warm-brown)] mb-3">
            You&apos;re all set!
          </h1>
          <p className="text-[var(--warm-gray)] text-lg">
            Share the link with your people
          </p>
        </div>

        <div className="space-y-6 animate-fadeInUp stagger-1">
          {/* Event info card */}
          <div className="card-elevated p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--peach-light)] flex items-center justify-center text-2xl">
                📅
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-[var(--warm-brown)]">
                  {event.title}
                </h2>
                {event.location && (
                  <p className="text-[var(--warm-gray)] text-sm mt-1">
                    📍 {event.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Share link */}
          <div className="card-elevated p-6">
            <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-3">
              🔗 Share this with friends
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)] text-[var(--warm-brown)] font-mono text-sm"
              />
              <CopyButton text={shareUrl} />
            </div>
          </div>

          {/* Admin link */}
          <div className="card-elevated p-6">
            <label className="block text-sm font-semibold text-[var(--warm-brown)] mb-3">
              🔐 Your admin link <span className="font-normal text-[var(--warm-gray-light)]">(save this!)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={manageUrl}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)] text-[var(--warm-brown)] font-mono text-sm"
              />
              <CopyButton text={manageUrl} />
            </div>
            <p className="text-xs text-[var(--warm-gray-light)] mt-2">
              Use your 4-digit code to see who&apos;s free
            </p>
          </div>

          {/* Tip */}
          <div className="bg-[var(--peach-light)] rounded-2xl p-4 border border-[var(--peach)] flex items-start gap-3">
            <span className="text-xl">💡</span>
            <p className="text-sm text-[var(--warm-brown)]">
              <span className="font-semibold">Pro tip:</span> Text or email both links to yourself so you don&apos;t lose them!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/${eventId}`}
              className="btn-secondary flex-1 text-center"
            >
              Preview Event
            </Link>
            <Link
              href={`/${eventId}/manage`}
              className="btn-primary flex-1 text-center"
            >
              View Responses →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--warm-gray-light)] mt-12">
          Made with 💛 by WhenFree
        </p>
      </div>
    </main>
  );
}
