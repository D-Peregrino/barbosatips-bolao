import { CommercialPageShell } from "@/components/layout/CommercialPageShell";

export default function RootLoading() {
  return (
    <div
      className="commercial-page-bg min-h-[50vh] pb-16 pt-6 text-cream sm:pt-8"
      aria-busy="true"
      aria-label="A carregar o portal"
    >
      <CommercialPageShell mainClassName="space-y-8">
        <div className="space-y-4">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-pitch-800/90 ring-1 ring-gold-400/10" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-pitch-800/80 ring-1 ring-white/5" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-pitch-800/70 ring-1 ring-white/5" />
          <div className="h-4 w-2/3 max-w-md animate-pulse rounded bg-pitch-800/60 ring-1 ring-white/5" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-gradient-to-br from-pitch-900/90 to-black ring-1 ring-gold-400/8"
            />
          ))}
        </div>

        <div className="h-24 animate-pulse rounded-2xl bg-pitch-900/80 ring-1 ring-gold-400/10" />
      </CommercialPageShell>
    </div>
  );
}
