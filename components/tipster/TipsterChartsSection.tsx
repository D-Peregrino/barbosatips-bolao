import type { MonthPerformance, RoiSeriesPoint } from "@/lib/tipsters/aggregate-picks";
import type { QuickPickRow } from "@/lib/picks/types";

function RoiEvolutionChart({ series }: { series: RoiSeriesPoint[] }) {
  const slice = series.slice(-80);
  if (slice.length < 2) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-gold-400/20 bg-black/30 text-sm text-stone-500">
        Ainda não há histórico suficiente para o gráfico de evolução.
      </div>
    );
  }

  const vals = slice.map((p) => p.cumulativeUnits);
  const minY = Math.min(...vals, 0);
  const maxY = Math.max(...vals, 0.01);
  const pad = 8;
  const W = 520;
  const H = 160;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  const pts = slice.map((p, i) => {
    const x = pad + (i / (slice.length - 1)) * innerW;
    const t = (p.cumulativeUnits - minY) / (maxY - minY || 1);
    const y = pad + innerH - t * innerH;
    return `${x},${y}`;
  });

  const d = `M ${pts.join(" L ")}`;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gold-400/12 bg-black/40 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-h-[200px]" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <linearGradient id="roiStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9a227" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#f5ecd4" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a227" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${d} L ${pad + innerW} ${pad + innerH} L ${pad} ${pad + innerH} Z`}
          fill="url(#roiFill)"
          stroke="none"
        />
        <path d={d} fill="none" stroke="url(#roiStroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="mt-1 text-center text-[10px] text-stone-600">
        Unidades cumulativas · últimas {slice.length} picks encerradas
      </p>
    </div>
  );
}

function MonthlyBarsChart({ months }: { months: MonthPerformance[] }) {
  const last = months.slice(-10);
  if (last.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-gold-400/20 bg-black/30 text-sm text-stone-500">
        Sem dados mensais ainda.
      </div>
    );
  }

  const maxPick = Math.max(...last.map((m) => m.greens + m.reds), 1);
  const barW = 36;
  const gap = 10;
  const W = last.length * (barW + gap) + 16;
  const H = 160;
  const baseY = H - 28;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gold-400/12 bg-black/40 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[320px]" aria-hidden>
        {last.map((m, i) => {
          const x = 12 + i * (barW + gap);
          const gH = (m.greens / maxPick) * (H - 48);
          const rH = (m.reds / maxPick) * (H - 48);
          return (
            <g key={m.key}>
              <rect
                x={x}
                y={baseY - gH - rH}
                width={barW / 2 - 2}
                height={Math.max(gH, 1)}
                rx={3}
                fill="rgba(52, 211, 153, 0.55)"
              />
              <rect
                x={x + barW / 2 + 2}
                y={baseY - rH}
                width={barW / 2 - 2}
                height={Math.max(rH, 1)}
                rx={3}
                fill="rgba(251, 113, 133, 0.55)"
              />
              <text
                x={x + barW / 2}
                y={H - 8}
                textAnchor="middle"
                fill="#78716c"
                fontSize="9"
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[10px] text-stone-600">Verde = greens · Rosa = reds (altura ∝ volume)</p>
    </div>
  );
}

function HistoryTable({ picks }: { picks: QuickPickRow[] }) {
  if (picks.length === 0) {
    return <p className="text-sm text-stone-500">Sem histórico.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gold-400/12">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-gold-400/10 bg-black/50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          <tr>
            <th className="px-3 py-2">Jogo</th>
            <th className="px-3 py-2">Mercado</th>
            <th className="px-3 py-2 text-right">Odd</th>
            <th className="px-3 py-2 text-center">Res.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {picks.map((p) => {
            const res =
              p.status === "ativo"
                ? "Ao vivo"
                : p.resultado === "green"
                  ? "Green"
                  : p.resultado === "red"
                    ? "Red"
                    : p.resultado === "void"
                      ? "Void"
                      : "—";
            const tone =
              p.resultado === "green"
                ? "text-emerald-300"
                : p.resultado === "red"
                  ? "text-rose-200"
                  : "text-stone-400";
            return (
              <tr key={p.id} className="bg-black/20 hover:bg-white/[0.02]">
                <td className="max-w-[200px] truncate px-3 py-2 font-medium text-cream">{p.jogo}</td>
                <td className="max-w-[160px] truncate px-3 py-2 text-stone-500">{p.mercado}</td>
                <td className="px-3 py-2 text-right font-mono font-bold text-gold-200">
                  @{p.odd.toFixed(2)}
                </td>
                <td className={`px-3 py-2 text-center text-xs font-bold uppercase ${tone}`}>{res}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  roiSeries: RoiSeriesPoint[];
  monthly: MonthPerformance[];
  history: QuickPickRow[];
};

export function TipsterChartsSection({ roiSeries, monthly, history }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="commercial-card-elevated rounded-2xl border p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-cream">Evolução de unidades</h2>
        <p className="mt-1 text-xs text-stone-500">Curva cumulativa (ROI em unidades, stake 1u).</p>
        <div className="mt-4">
          <RoiEvolutionChart series={roiSeries} />
        </div>
      </div>

      <div className="commercial-card-elevated rounded-2xl border p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-cream">Desempenho mensal</h2>
        <p className="mt-1 text-xs text-stone-500">Distribuição de greens vs reds por mês.</p>
        <div className="mt-4">
          <MonthlyBarsChart months={monthly} />
        </div>
      </div>

      <div className="commercial-card-elevated rounded-2xl border p-5 sm:p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-cream">Histórico recente</h2>
        <p className="mt-1 text-xs text-stone-500">Últimas linhas encerradas ou em destaque.</p>
        <div className="mt-4">
          <HistoryTable picks={history} />
        </div>
      </div>
    </div>
  );
}
