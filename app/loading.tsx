export default function RootLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-24" aria-busy="true" aria-label="A carregar">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-pitch-800 ring-1 ring-white/5" />
      <div className="mt-8 space-y-4">
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-pitch-800/90 ring-1 ring-white/5" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-pitch-800/80 ring-1 ring-white/5" />
        <div className="h-4 w-2/3 max-w-lg animate-pulse rounded bg-pitch-800/70 ring-1 ring-white/5" />
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-pitch-900 ring-1 ring-gold-400/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-pitch-900 ring-1 ring-gold-400/5" />
      </div>
    </div>
  );
}
