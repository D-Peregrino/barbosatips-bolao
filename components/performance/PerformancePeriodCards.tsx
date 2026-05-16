import type { PerformancePeriodStats } from "@/lib/picks/performance-periods";
import { cn } from "@/lib/utils";

function Kpi({
  label,
  value,
  hint,
  accent = "gold",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "gold" | "green" | "red" | "neutral";
}) {
  const accentClass =
    accent === "green"
      ? "text-emerald-400"
      : accent === "red"
        ? "text-red-400"
        : accent === "neutral"
          ? "text-zinc-300"
          : "text-amber-300";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br p-4 sm:p-5 transition duration-300",
        "from-zinc-900/60 via-black/80 to-zinc-950/90",
        "hover:border-amber-500/25 hover:shadow-[0_0_36px_-12px_rgba(245,158,11,0.2)]",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-2xl font-bold tabular-nums sm:text-3xl",
          accentClass,
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] leading-snug text-zinc-600">{hint}</p>
      ) : null}
    </div>
  );
}

function formatStreak(stats: PerformancePeriodStats): string {
  if (stats.streakAtual === 0 || !stats.streakAtualTipo) return "—";
  const n = Math.abs(stats.streakAtual);
  if (stats.streakAtualTipo === "green") {
    return `${n} green${n !== 1 ? "s" : ""}`;
  }
  return `${n} red${n !== 1 ? "s" : ""}`;
}

type Props = {
  stats: PerformancePeriodStats;
};

export function PerformancePeriodCards({ stats }: Props) {
  const fmtPct = (v: number | null) => (v != null ? `${v}%` : "—");
  const fmtRoi = (v: number | null) =>
    v != null ? `${v > 0 ? "+" : ""}${v}%` : "—";
  const lucro =
    stats.lucroUnidades === 0
      ? "0u"
      : `${stats.lucroUnidades > 0 ? "+" : ""}${stats.lucroUnidades}u`;

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        Período: <span className="font-semibold text-amber-200/90">{stats.label}</span>
        {" · "}
        Picks pendentes/ativas não entram no cálculo · void separado · ROI com odd real
        (green = odd−1, red = −1).
        {stats.ativasNoPeriodo > 0 ? (
          <span className="text-zinc-600">
            {" "}
            · {stats.ativasNoPeriodo} pick{stats.ativasNoPeriodo !== 1 ? "s" : ""} ainda
            ativa{stats.ativasNoPeriodo !== 1 ? "s" : ""} no período.
          </span>
        ) : null}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total resolvidas"
          value={String(stats.totalResolvidas)}
          hint="Green + red + void"
          accent="neutral"
        />
        <Kpi label="Greens" value={String(stats.greens)} accent="green" />
        <Kpi label="Reds" value={String(stats.reds)} accent="red" />
        <Kpi label="Voids" value={String(stats.voids)} hint="Fora da winrate" accent="neutral" />
        <Kpi
          label="Winrate"
          value={fmtPct(stats.winratePct)}
          hint="Greens ÷ (greens+reds)"
          accent="gold"
        />
        <Kpi
          label="ROI"
          value={fmtRoi(stats.roiPct)}
          hint={`Lucro ${lucro} · stake 1u`}
          accent="gold"
        />
        <Kpi
          label="Streak atual"
          value={formatStreak(stats)}
          hint="Mais recente · void não conta"
          accent={
            stats.streakAtualTipo === "red"
              ? "red"
              : stats.streakAtualTipo === "green"
                ? "green"
                : "neutral"
          }
        />
        <Kpi
          label="Streak máxima"
          value={String(stats.streakMaximaGreen)}
          hint="Recorde de greens seguidos"
          accent="green"
        />
      </div>
    </div>
  );
}
