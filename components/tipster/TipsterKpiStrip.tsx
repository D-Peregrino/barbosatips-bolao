import type { HomePerformanceSnapshot } from "@/lib/home/home-performance";

type Props = { snapshot: HomePerformanceSnapshot };

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="commercial-card-elevated min-w-[140px] flex-1 rounded-xl border px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold tabular-nums text-cream sm:text-2xl">{value}</p>
      {sub ? <p className="mt-0.5 text-[10px] text-stone-600">{sub}</p> : null}
    </div>
  );
}

function streakLabel(n: number): string {
  if (n === 0) return "—";
  if (n > 0) return `+${n}G`;
  return `${n}R`;
}

export function TipsterKpiStrip({ snapshot }: Props) {
  const roi =
    snapshot.roiPct != null ? `${snapshot.roiPct >= 0 ? "+" : ""}${snapshot.roiPct}%` : "—";
  const taxa = snapshot.taxaAcertoPct != null ? `${snapshot.taxaAcertoPct}%` : "—";
  const u =
    snapshot.unidades === 0
      ? "0u"
      : `${snapshot.unidades > 0 ? "+" : ""}${snapshot.unidades}u`;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Kpi label="ROI médio" value={roi} sub="Yield 1u · picks encerradas" />
      <Kpi label="Greens" value={String(snapshot.greens)} />
      <Kpi label="Reds" value={String(snapshot.reds)} />
      <Kpi label="Taxa acerto" value={taxa} sub="G ÷ (G+R)" />
      <Kpi label="Streak" value={streakLabel(snapshot.streakAtual)} sub="Últimas encerradas" />
      <Kpi label="Unidades" value={u} sub={`Voids: ${snapshot.voids}`} />
    </div>
  );
}
