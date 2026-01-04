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
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Event Created!
          </h1>
          <p className="text-gray-600 text-lg">
            Share the link below with your friends
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {event.title}
            </h2>
            {event.location && (
              <p className="text-gray-500 text-sm mb-4">
                {event.location}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share this link with friends
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-mono text-sm"
                  />
                  <CopyButton text={shareUrl} label="Copy" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your admin link (bookmark this!)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={manageUrl}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-mono text-sm"
                  />
                  <CopyButton text={manageUrl} label="Copy" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use your 4-digit code to view responses
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-amber-800">
                <span className="font-medium">Tip:</span> Send both links to yourself
                via email or notes app so you don&apos;t lose them!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/${eventId}`}
              className="flex-1 py-4 rounded-xl font-semibold text-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
            >
              View Event
            </Link>
            <Link
              href={`/${eventId}/manage`}
              className="flex-1 py-4 rounded-xl font-semibold text-center text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg transition-all"
            >
              Manage Responses
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
