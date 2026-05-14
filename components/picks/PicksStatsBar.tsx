import type { QuickPickStatsResumo } from "@/lib/picks/stats";

export function PicksStatsBar({ stats }: { stats: QuickPickStatsResumo }) {
  const { greens, reds, voids, taxaAcertoPct } = stats;

  return (
    <div className="mb-10">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/35 px-5 py-4 shadow-[inset_0_1px_0_rgba(52,211,153,0.12)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">
            Greens
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-emerald-200 drop-shadow-[0_0_18px_rgba(52,211,153,0.2)]">
            {greens}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-400/35 bg-rose-950/35 px-5 py-4 shadow-[inset_0_1px_0_rgba(251,113,133,0.1)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300/95">
            Reds
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-rose-100 drop-shadow-[0_0_16px_rgba(251,113,133,0.18)]">
            {reds}
          </p>
        </div>
        <div className="rounded-2xl border border-gold-400/30 bg-gradient-to-br from-pitch-900/90 to-[var(--color-void)] px-5 py-4 shadow-[inset_0_1px_0_rgba(232,207,122,0.08)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/95">
            Taxa de acerto
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">
            <span className="text-gold-gradient">
              {taxaAcertoPct != null ? `${taxaAcertoPct}%` : "—"}
            </span>
          </p>
          <p className="mt-1 text-[11px] leading-snug text-stone-500">
            Picks encerradas: greens ÷ (greens + reds). Void não entra.
          </p>
        </div>
      </div>
      {voids > 0 ? (
        <p className="mt-3 text-center text-xs text-stone-500">
          Voids encerrados: <span className="font-semibold text-cream-muted">{voids}</span>
        </p>
      ) : null}
    </div>
  );
}
