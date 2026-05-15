"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, RefreshCw } from "lucide-react";
import { refreshMarketEvResultsAction } from "@/app/admin/(panel)/mercados/resultados/actions";
import type { MarketEvDashboardData } from "@/lib/betting/market-ev-results";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: MarketEvDashboardData;
};

function StatCard({
  title,
  value,
  sub,
  className,
}: {
  title: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gold-400/12 bg-[#0c0b09]/90 p-4 shadow-[0_0_24px_-8px_rgba(212,175,55,0.08)]",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{title}</p>
      <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}

const chartTooltipStyle = {
  backgroundColor: "#1c1917",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 8,
};

export function MarketResultsClient({ dashboard }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { totals, roi7d, roi30d, roiByMercado, roiByTier, cumulative, distributionMercado } =
    dashboard;

  const handleRefresh = () => {
    setMsg(null);
    startTransition(async () => {
      const r = await refreshMarketEvResultsAction();
      if (!r.ok) {
        setMsg(r.error);
        return;
      }
      const extra =
        r.errors.length > 0 ? ` Avisos: ${r.errors.slice(0, 3).join(" · ")}` : "";
      setMsg(
        `Processados ${r.processed}: ${r.settled} liquidados, ${r.skipped} ignorados.${extra}`,
      );
      router.refresh();
    });
  };

  const hasCharts = cumulative.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold-400/12 bg-[#0c0b09]/80 p-4">
        <p className="text-sm text-stone-400">
          Até 100 snapshots pendentes por execução. Requer jogos finalizados na API-Football.
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-500/25 to-amber-600/15 px-4 py-2 text-sm font-semibold text-gold-50 ring-1 ring-gold-400/35 transition hover:from-gold-500/35 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          Atualizar resultados
        </button>
      </div>

      {msg && (
        <p className="rounded-lg border border-stone-700 bg-stone-900/60 px-4 py-2 text-sm text-stone-300">
          {msg}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Lucro total (u.)"
          value={totals.totalLucro >= 0 ? `+${totals.totalLucro}` : String(totals.totalLucro)}
          sub={`${totals.totalBets} apostas`}
        />
        <StatCard title="Yield" value={`${totals.yieldPct.toFixed(2)}%`} sub="Lucro médio / aposta" />
        <StatCard
          title="Greens / Reds"
          value={`${totals.greens} / ${totals.reds}`}
          sub={
            totals.totalBets > 0
              ? `${((totals.greens / totals.totalBets) * 100).toFixed(1)}% acerto`
              : undefined
          }
        />
        <StatCard title="ROI 7d / 30d" value={`${roi7d.toFixed(2)}%`} sub={`30d: ${roi30d.toFixed(2)}% yield`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
            ROI por mercado
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {roiByMercado.length === 0 ? (
              <li className="text-stone-500">Sem dados.</li>
            ) : (
              roiByMercado.map((row) => (
                <li
                  key={row.mercado}
                  className="flex justify-between border-b border-stone-800/80 py-2 text-stone-300"
                >
                  <span>{row.mercado}</span>
                  <span className="tabular-nums text-gold-200/90">
                    {row.yieldPct.toFixed(2)}% · {row.bets} n
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
            ROI por tier (snapshot)
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {roiByTier.length === 0 ? (
              <li className="text-stone-500">Sem dados.</li>
            ) : (
              roiByTier.map((row) => (
                <li
                  key={row.tier}
                  className="flex justify-between border-b border-stone-800/80 py-2 text-stone-300"
                >
                  <span className="capitalize">{row.tier}</span>
                  <span className="tabular-nums text-gold-200/90">
                    {row.yieldPct.toFixed(2)}% · {row.bets} n
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {mounted && hasCharts ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 p-4">
            <h2 className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
              Lucro acumulado
            </h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulative} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="label" tick={{ fill: "#78716c", fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#78716c", fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "#e7e5e4" }} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#d4af37"
                    strokeWidth={2}
                    dot={false}
                    name="Lucro acum."
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 p-4">
            <h2 className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
              Distribuição por mercado
            </h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionMercado} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="mercado" tick={{ fill: "#78716c", fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#78716c", fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="greens" name="Greens" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reds" name="Reds" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-stone-700 py-12 text-center text-sm text-stone-500">
          {mounted
            ? "Ainda não há resultados liquidados. Guarda snapshots em Mercados EV+ e clica em Atualizar resultados."
            : "A carregar gráficos…"}
        </p>
      )}
    </div>
  );
}
