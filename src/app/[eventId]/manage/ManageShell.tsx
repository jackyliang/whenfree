import ManageContent from './ManageContent';

interface ManageShellProps {
  eventId: string;
  eventTitle: string;
  initialCode?: string;
}

export default function ManageShell({ eventId, eventTitle, initialCode }: ManageShellProps) {
  return (
    <main className="min-h-dvh bg-[var(--cream)] noise-bg relative overflow-x-clip">
      {/* Decorative blobs */}
      <div className="blob blob-peach w-80 h-80 -top-20 -right-20 animate-pulse-soft" />
      <div className="blob blob-coral w-64 h-64 bottom-20 -left-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-6 sm:py-12">
        <ManageContent eventId={eventId} eventTitle={eventTitle} initialCode={initialCode} />
      </div>
    </main>
  );
}
