"use client";

import Link from "next/link";
import { FilePlus } from "lucide-react";
import { EVBadge } from "@/components/admin/markets/EVBadge";
import { ProbabilityBar } from "@/components/admin/markets/ProbabilityBar";
import { buildMarketAnalysisHref } from "@/lib/betting/build-market-board";
import type { MarketBoardRow } from "@/lib/betting/build-market-board";
import { cn } from "@/lib/utils";

type Props = {
  rows: MarketBoardRow[];
  className?: string;
};

function formatEv(ev: number): string {
  const pct = ev * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function MarketBoardTable({ rows, className }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-700 py-16 text-center text-stone-500">
        Nenhum mercado EV+ encontrado com os filtros atuais.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 shadow-[0_0_40px_-12px_rgba(212,175,55,0.1)]",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-800/90 bg-stone-950/80 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <th className="px-4 py-3">Jogo</th>
              <th className="px-4 py-3">Campeonato</th>
              <th className="px-4 py-3">Mercado</th>
              <th className="px-4 py-3 text-right">Odd</th>
              <th className="min-w-[140px] px-4 py-3">Probabilidades</th>
              <th className="px-4 py-3 text-right">Edge</th>
              <th className="px-4 py-3 text-right">EV</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="transition hover:bg-gold-500/[0.04]"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{row.matchLabel}</p>
                  <p className="text-xs text-stone-500">{row.kickoffLabel}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-stone-300">{row.league}</p>
                  <p className="text-xs text-stone-600">{row.country}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-stone-800/80 px-2 py-1 text-xs font-medium text-gold-200/90 ring-1 ring-stone-700/80">
                    {row.marketLabel}
                  </span>
                  {row.bookmaker && (
                    <p className="mt-1 text-[10px] text-stone-600">{row.bookmaker}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-display text-base font-semibold tabular-nums text-white">
                  {row.marketOdd.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <ProbabilityBar
                    real={row.realProbability}
                    implied={row.impliedProbability}
                  />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-300">
                  {row.edge >= 0 ? "+" : ""}
                  {row.edge.toFixed(1)} pp
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-semibold tabular-nums",
                    row.ev >= 0.03 ? "text-emerald-400" : row.ev < 0 ? "text-red-400" : "text-stone-400",
                  )}
                >
                  {formatEv(row.ev)}
                </td>
                <td className="px-4 py-3">
                  <EVBadge tier={row.tier} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={buildMarketAnalysisHref(row)}
                    className="inline-flex items-center gap-1 rounded-lg bg-gold-500/12 px-2.5 py-1.5 text-xs font-medium text-gold-300 ring-1 ring-gold-500/25 transition hover:bg-gold-500/20"
                  >
                    <FilePlus className="h-3.5 w-3.5" aria-hidden />
                    Criar análise
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
