import Link from "next/link";
import type { BreakdownRow, PerformanceModel, UltimoResultado } from "@/lib/picks/performance-compute";
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
        Ainda não há picks encerradas com resultado para mostrar nesta secção.
      </div>
    );
  }

  return (
    <div className="commercial-card-elevated overflow-hidden">
      <div className="border-b border-amber-500/15 bg-black/30 px-5 py-4">
        <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Picks encerradas · ROI 1u: green = odd−1, red = −1, void = 0.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800/90 bg-zinc-950/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <tr>
              {showIcon ? <th className="w-12 px-4 py-3" /> : null}
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

function badgeResultado(r: UltimoResultado): { label: string; className: string } {
  if (r.resultado === "green")
    return {
      label: "GREEN",
      className: "border-emerald-500/45 bg-emerald-500/15 text-emerald-200",
    };
  if (r.resultado === "red")
    return { label: "RED", className: "border-red-500/45 bg-red-500/15 text-red-200" };
  return { label: "VOID", className: "border-slate-500/45 bg-slate-700/30 text-slate-200" };
}

function UltimosResultados({ items }: { items: UltimoResultado[] }) {
  if (items.length === 0) {
    return (
      <div className="commercial-card-elevated p-8 text-center text-sm text-zinc-500">
        Ainda não há resultados encerrados para listar.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r) => {
        const b = badgeResultado(r);
        const d = new Date(r.ts);
        const quando = Number.isNaN(d.getTime())
          ? "—"
          : d.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Sao_Paulo",
            });
        return (
          <li key={r.id}>
            <div
              className={cn(
                "flex h-full flex-col rounded-2xl border border-white/[0.06] bg-gradient-to-br p-4 transition duration-300",
                "from-zinc-900/55 via-black/70 to-zinc-950/90",
                "hover:border-amber-500/25 hover:shadow-[0_0_28px_-10px_rgba(245,158,11,0.18)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide",
                    b.className,
                  )}
                >
                  {b.label}
                </span>
                <span className="shrink-0 font-display text-sm font-bold tabular-nums text-amber-300">
                  @{r.odd.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 font-display text-sm font-bold leading-snug text-white">
                {r.jogo}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{r.mercado}</p>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[10px] text-zinc-500">
                <span>{r.esporteLabel}</span>
                <span className="tabular-nums text-zinc-600">{quando}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function PerformanceDashboard({ model }: { model: PerformanceModel }) {
  const fmtPct = (v: number | null) => (v != null ? `${v}%` : "—");
  const fmtRoi = (v: number | null) =>
    v != null ? `${v > 0 ? "+" : ""}${v}%` : "—";
  const fmtOdd = (v: number | null) => (v != null ? String(v) : "—");

  const seqLabel =
    model.sequenciaAtualTipo === "green"
      ? `${model.sequenciaAtual} green${model.sequenciaAtual !== 1 ? "s" : ""} seguidos`
      : model.sequenciaAtualTipo === "red"
        ? `${model.sequenciaAtual} red${model.sequenciaAtual !== 1 ? "s" : ""} seguidos`
        : "—";

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center gap-2">
        {model.hotStreak ? (
          <span className="inline-flex items-center rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200 shadow-[0_0_24px_-6px_rgba(52,211,153,0.35)]">
            Hot streak
          </span>
        ) : null}
        {model.coldStreak ? (
          <span className="inline-flex items-center rounded-full border border-red-500/50 bg-red-500/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-200 shadow-[0_0_24px_-6px_rgba(248,113,113,0.25)]">
            Cold streak
          </span>
        ) : null}
        {!model.hotStreak && !model.coldStreak && model.totalPicks > 0 ? (
          <span className="text-xs text-zinc-500">
            Sequência atual abaixo dos limiares de destaque (≥3 para badge).
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi
          label="Total de picks"
          value={String(model.totalPicks)}
          hint={`${model.ativas} ativas · ${model.encerradas} encerradas`}
          accent="neutral"
        />
        <Kpi label="Greens" value={String(model.greens)} accent="green" />
        <Kpi label="Reds" value={String(model.reds)} accent="red" />
        <Kpi
          label="Voids"
          value={String(model.voids)}
          hint="Lucro 0u no modelo ROI"
          accent="neutral"
        />
        <Kpi
          label="Taxa de acerto"
          value={fmtPct(model.taxaAcertoPct)}
          hint={`Amostra: ${model.apostasComResultado} (green+red)`}
          accent="gold"
        />
        <Kpi
          label="ROI estimado"
          value={fmtRoi(model.roiEstimadoPct)}
          hint="Média por aposta green/red · void = 0"
          accent="gold"
        />
        <Kpi label="Odd média" value={fmtOdd(model.oddMedia)} hint="Encerradas com resultado" accent="neutral" />
        <Kpi
          label="Sequência atual"
          value={seqLabel}
          hint="Do resultado mais recente (void não conta)"
          accent={
            model.sequenciaAtualTipo === "red"
              ? "red"
              : model.sequenciaAtualTipo === "green"
                ? "green"
                : "neutral"
          }
        />
        <Kpi
          label="Maior sequência green"
          value={String(model.melhorSequenciaGreen)}
          hint="Recorde histórico"
          accent="green"
        />
        <Kpi
          label="Maior sequência red"
          value={String(model.maiorSequenciaRed)}
          hint="Recorde histórico"
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

      <section aria-labelledby="ultimos-resultados-heading">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="ultimos-resultados-heading"
              className="font-display text-xl font-bold text-white sm:text-2xl"
            >
              Últimos resultados
            </h2>
            <p className="text-xs text-zinc-500">
              Ordenados do mais recente ao mais antigo — atualizam quando as picks encerram com
              resultado.
            </p>
          </div>
        </div>
        <UltimosResultados items={model.ultimosResultados} />
      </section>

      <PerformanceCharts
        serieGreensReds={model.serieGreensReds}
        serieRoi={model.serieRoi}
        semanal={model.semanal}
        diarioTrintaDias={model.diarioTrintaDias}
      />

      <div className="grid gap-8 lg:grid-cols-1">
        <BreakdownTable title="Desempenho por esporte" rows={model.porEsporte} showIcon />
        <BreakdownTable
          title="Desempenho por competição (categoria)"
          rows={model.porCampeonato}
          showIcon
        />
        <BreakdownTable title="Desempenho por mercado" rows={model.porMercado} showIcon={false} />
      </div>

      <p className="text-center text-[11px] leading-relaxed text-zinc-600">
        As métricas refletem o estado actual das picks públicas — quando um resultado passa a
        vitória, derrota ou sem efeito, taxa, ROI, sequências e gráficos actualizam-se nesta página.
      </p>
    </div>
  );
}
