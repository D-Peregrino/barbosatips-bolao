import Link from "next/link";
import type { HomePerformanceSnapshot } from "@/lib/home/home-performance";
import { cn } from "@/lib/utils";

type Props = {
  stats: HomePerformanceSnapshot;
  embedded?: boolean;
};

function StatChip({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-black/35 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 font-display text-lg font-bold tabular-nums text-cream sm:text-xl">
        {value}
      </p>
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

export function HomePerformanceBar({ stats, embedded = false }: Props) {
  const roi =
    stats.roiPct != null ? `${stats.roiPct >= 0 ? "+" : ""}${stats.roiPct}%` : "—";
  const taxa =
    stats.taxaAcertoPct != null ? `${stats.taxaAcertoPct}%` : "—";
  const unidades =
    stats.unidades === 0
      ? "0u"
      : `${stats.unidades > 0 ? "+" : ""}${stats.unidades}u`;
  const roiPositive = stats.roiPct != null && stats.roiPct >= 0;

  const body = (
    <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-6">
      <div className="perf-hero-stat flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">
            ROI · {stats.periodLabel}
          </p>
          <p
            className={cn(
              "perf-hero-stat-value mt-2",
              stats.roiPct != null && !roiPositive && "text-rose-300",
            )}
          >
            {roi}
          </p>
          <p className="mt-2 text-xs text-stone-500">
            {stats.totalResolvidas} picks resolvidas · stake 1u · voids fora da taxa
          </p>
        </div>
        <Link
          href="/performance?period=30d"
          className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-emerald-300/90 transition hover:text-emerald-200"
        >
          Ver painel completo →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <StatChip label="Winrate" value={taxa} hint="Greens ÷ (G+R)" />
        <StatChip label="Unidades" value={unidades} hint="Lucro flat 1u" />
        <StatChip label="Streak" value={formatStreak(stats.streakAtual)} hint="Atual" />
        <StatChip
          label="Recorde green"
          value={String(stats.streakMaximaGreen)}
          hint="Máx. seguidos"
        />
        <StatChip
          label="G / R / V"
          value={`${stats.greens} / ${stats.reds} / ${stats.voids}`}
        />
        <StatChip label="Total" value={String(stats.totalResolvidas)} hint="No período" />
      </div>
    </div>
  );

  if (embedded) {
    return <div aria-label="Performance de picks">{body}</div>;
  }

  return (
    <section
      className="portal-surface relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6"
      aria-labelledby="home-perf-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(201,162,39,0.1),transparent_50%)]"
        aria-hidden
      />
      <h2
        id="home-perf-heading"
        className="relative mb-5 font-display text-xl font-bold tracking-tight text-cream sm:text-2xl"
      >
        Performance <span className="text-gold-gradient">(picks)</span>
      </h2>
      {body}
    </section>
  );
}
