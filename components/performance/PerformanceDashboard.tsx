import Link from "next/link";
import type { BreakdownRow, PerformanceModel } from "@/lib/picks/performance-compute";
import { PerformanceCharts } from "@/components/performance/PerformanceCharts";
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
        "group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br p-5 transition duration-300",
        "from-zinc-900/60 via-black/80 to-zinc-950/90",
        "hover:border-amber-500/25 hover:shadow-[0_0_36px_-12px_rgba(245,158,11,0.2)]",
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-bold tabular-nums sm:text-3xl", accentClass)}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs leading-snug text-zinc-600">{hint}</p> : null}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  showIcon,
}: {
  title: string;
  rows: BreakdownRow[];
  showIcon: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="commercial-card-elevated p-8 text-center text-sm text-zinc-500">
        Sem dados para {title.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="commercial-card-elevated overflow-hidden">
      <div className="border-b border-amber-500/15 bg-black/30 px-5 py-4">
        <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Apenas picks encerradas · taxa = greens ÷ (greens + reds).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800/90 bg-zinc-950/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <tr>
              {showIcon ? <th className="px-4 py-3 w-12" /> : null}
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right text-emerald-400/90">Greens</th>
              <th className="px-4 py-3 text-right text-red-400/90">Reds</th>
              <th className="px-4 py-3 text-right text-slate-400">Voids</th>
              <th className="px-4 py-3 text-right">Taxa</th>
              <th className="px-4 py-3 text-right">ROI 1u</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.key}
                className="border-b border-zinc-800/50 transition hover:bg-amber-500/[0.04]"
              >
                {showIcon ? (
                  <td className="px-4 py-3 text-lg" aria-hidden>
                    {r.icon}
                  </td>
                ) : null}
                <td className="px-4 py-3 font-medium text-zinc-200">{r.label}</td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{r.total}</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-300/90">
                  {r.greens}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-red-300/90">{r.reds}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-400">{r.voids}</td>
                <td className="px-4 py-3 text-right tabular-nums text-amber-200/90">
                  {r.taxaPct != null ? `${r.taxaPct}%` : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-300/90">
                  {r.roiPct != null ? `${r.roiPct > 0 ? "+" : ""}${r.roiPct}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PerformanceDashboard({ model }: { model: PerformanceModel }) {
  const fmtPct = (v: number | null) => (v != null ? `${v}%` : "—");
  const fmtRoi = (v: number | null) =>
    v != null ? `${v > 0 ? "+" : ""}${v}%` : "—";
  const fmtOdd = (v: number | null) => (v != null ? String(v) : "—");

  return (
    <div className="space-y-12">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Total de picks" value={String(model.totalPicks)} hint={`${model.ativas} ativas · ${model.encerradas} encerradas`} accent="neutral" />
        <Kpi label="Greens" value={String(model.greens)} accent="green" />
        <Kpi label="Reds" value={String(model.reds)} accent="red" />
        <Kpi label="Voids" value={String(model.voids)} hint="Neutro no ROI (1u)" accent="neutral" />
        <Kpi
          label="Taxa de acerto"
          value={fmtPct(model.taxaAcertoPct)}
          hint={`Amostra: ${model.apostasComResultado} picks (green+red)`}
          accent="gold"
        />
        <Kpi
          label="ROI estimado"
          value={fmtRoi(model.roiEstimadoPct)}
          hint="1 unidade por pick · void não entra na amostra"
          accent="gold"
        />
        <Kpi label="Odd média" value={fmtOdd(model.oddMedia)} hint="Encerradas com resultado" accent="neutral" />
        <Kpi
          label="Melhor sequência green"
          value={String(model.melhorSequenciaGreen)}
          hint="Máx. greens seguidos (void não quebra)"
          accent="green"
        />
        <Kpi
          label="Pior sequência red"
          value={String(model.piorSequenciaRed)}
          hint="Máx. reds seguidos"
          accent="red"
        />
      </div>

      <div className="commercial-card-elevated flex flex-col gap-3 border border-amber-500/15 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90">
            Resumo financeiro (modelo 1u)
          </p>
          <p className="mt-1 font-display text-xl font-bold text-white">
            Lucro acumulado:{" "}
            <span
              className={
                model.lucroAcumuladoUnidades >= 0 ? "text-emerald-400" : "text-red-400"
              }
            >
              {model.lucroAcumuladoUnidades > 0 ? "+" : ""}
              {model.lucroAcumuladoUnidades} u
            </span>
          </p>
        </div>
        <Link
          href="/picks"
          className="inline-flex items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 px-5 py-2.5 text-sm font-bold text-amber-100 transition hover:bg-amber-500/15"
        >
          Ver picks rápidas
        </Link>
      </div>

      <PerformanceCharts
        serieGreensReds={model.serieGreensReds}
        serieRoi={model.serieRoi}
        semanal={model.semanal}
      />

      <div className="grid gap-8 lg:grid-cols-1">
        <BreakdownTable title="Performance por esporte" rows={model.porEsporte} showIcon />
        <BreakdownTable title="Performance por mercado" rows={model.porMercado} showIcon={false} />
      </div>

      <p className="text-center text-[11px] leading-relaxed text-zinc-600">
        Métricas baseadas em <strong className="text-zinc-400">quick_picks</strong> públicas e
        premium agregadas. ROI é estimativa pedagógica (stake fixo 1u); resultados reais dependem
        da tua gestão de banca.
      </p>
    </div>
  );
}
