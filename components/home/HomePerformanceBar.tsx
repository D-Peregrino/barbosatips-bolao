import type { HomePerformanceSnapshot } from "@/lib/home/home-performance";

type Props = {
  stats: HomePerformanceSnapshot;
};

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="relative flex min-w-[140px] flex-1 flex-col rounded-xl border border-gold-400/12 bg-black/35 px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold tabular-nums text-cream sm:text-2xl">{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-stone-600">{hint}</p> : null}
    </div>
  );
}

function formatStreak(n: number): string {
  if (n === 0) return "—";
  if (n > 0) return `+${n} green${n > 1 ? "s" : ""}`;
  const r = Math.abs(n);
  return `−${r} red${r > 1 ? "s" : ""}`;
}

export function HomePerformanceBar({ stats }: Props) {
  const roi =
    stats.roiPct != null ? `${stats.roiPct >= 0 ? "+" : ""}${stats.roiPct}%` : "—";
  const taxa =
    stats.taxaAcertoPct != null ? `${stats.taxaAcertoPct}%` : "—";
  const unidades =
    stats.unidades === 0
      ? "0u"
      : `${stats.unidades > 0 ? "+" : ""}${stats.unidades}u`;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-gold-400/14 bg-gradient-to-r from-pitch-900/95 via-black/60 to-pitch-900/95 px-3 py-4 sm:px-5 sm:py-5"
      aria-labelledby="home-perf-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.08),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="home-perf-heading" className="font-display text-lg font-bold text-cream sm:text-xl">
          Performance <span className="text-gold-gradient">(picks)</span>
        </h2>
        <p className="text-[10px] text-stone-500 sm:text-[11px]">
          Amostra recente · stake plano 1u · voids fora da taxa
        </p>
      </div>
      <div className="relative flex flex-wrap gap-2 sm:gap-3">
        <Metric label="ROI médio" value={roi} hint="Sobre picks encerradas" />
        <Metric label="Taxa de acerto" value={taxa} hint="Greens ÷ (greens+reds)" />
        <Metric label="Streak" value={formatStreak(stats.streakAtual)} hint="Últimas encerradas" />
        <Metric label="Unidades" value={unidades} hint="Lucro líquido 1u flat" />
        <Metric
          label="Greens / Reds"
          value={`${stats.greens} / ${stats.reds}`}
          hint={stats.voids > 0 ? `Voids: ${stats.voids}` : undefined}
        />
      </div>
    </section>
  );
}
