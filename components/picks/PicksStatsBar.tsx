import type { QuickPickStatsResumo } from "@/lib/picks/stats";

export function PicksStatsBar({ stats }: { stats: QuickPickStatsResumo }) {
  const { greens, reds, voids, taxaAcertoPct } = stats;

  return (
    <div className="mb-10">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 px-5 py-4 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
            Greens
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-emerald-300">
            {greens}
          </p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 px-5 py-4 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/90">
            Reds
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-red-300">
            {reds}
          </p>
        </div>
        <div className="rounded-2xl border border-gold/35 bg-gradient-to-br from-amber-950/40 to-pitch-950 px-5 py-4 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/90">
            Taxa de acerto
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-gold">
            {taxaAcertoPct != null ? `${taxaAcertoPct}%` : "—"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-zinc-500">
            Picks encerradas: greens ÷ (greens + reds). Void não entra.
          </p>
        </div>
      </div>
      {voids > 0 ? (
        <p className="mt-3 text-center text-xs text-zinc-500">
          Voids encerrados: <span className="font-semibold text-zinc-400">{voids}</span>
        </p>
      ) : null}
    </div>
  );
}
