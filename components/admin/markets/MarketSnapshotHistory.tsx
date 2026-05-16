"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Filter } from "lucide-react";
import { EVBadge } from "@/components/admin/markets/EVBadge";
import { ProbabilityBar } from "@/components/admin/markets/ProbabilityBar";
import { BOARD_MARKET_LABELS } from "@/lib/betting/build-market-board";
import type { MarketEvSnapshotRow } from "@/lib/betting/market-ev-snapshots";
import type { EvTier } from "@/lib/betting/ev-engine";
import {
  translateLeagueName,
  translateMarketName,
  translateStatus,
  translateTier,
} from "@/lib/i18n/market-ptbr";
import { cn } from "@/lib/utils";

const TIERS: EvTier[] = ["elite", "forte", "moderado", "neutro", "negativo"];

type FilterState = {
  date: string;
  tier: string;
  mercado: string;
  campeonato: string;
};

type Props = {
  rows: MarketEvSnapshotRow[];
  dates: string[];
  campeonatos: string[];
  defaultDate: string;
};

function formatEv(ev: number): string {
  const pct = ev * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function MarketSnapshotHistory({
  rows,
  dates,
  campeonatos,
  defaultDate,
}: Props) {
  const [filters, setFilters] = useState<FilterState>({
    date: defaultDate,
    tier: "",
    mercado: "",
    campeonato: "",
  });

  const filtered = useMemo(() => {
    return rows
      .filter((row) => {
        if (filters.date && row.snapshot_date !== filters.date) return false;
        if (filters.tier && row.tier !== filters.tier) return false;
        if (filters.mercado && row.mercado !== filters.mercado) return false;
        if (filters.campeonato && row.campeonato !== filters.campeonato) return false;
        return true;
      })
      .sort((a, b) => b.ev - a.ev);
  }, [rows, filters]);

  const mercados = useMemo(() => {
    return Array.from(new Set([...BOARD_MARKET_LABELS, ...rows.map((row) => row.mercado)]));
  }, [rows]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/mercados"
        className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar à central EV+
      </Link>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gold-400/12 bg-[#0c0b09]/80 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400/90">
          <Filter className="h-4 w-4" aria-hidden />
          Filtros
        </div>
        <label className="block min-w-[130px]">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
            Data
          </span>
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
          >
            <option value="">Todas</option>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[120px]">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
            Nível
          </span>
          <select
            value={filters.tier}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
            className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
          >
            <option value="">Todos</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {translateTier(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[120px]">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
            Mercado
          </span>
          <select
            value={filters.mercado}
            onChange={(e) => setFilters({ ...filters, mercado: e.target.value })}
            className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
          >
            <option value="">Todos</option>
            {mercados.map((m) => (
              <option key={m} value={m}>
                {translateMarketName(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[160px]">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
            Campeonato
          </span>
          <select
            value={filters.campeonato}
            onChange={(e) => setFilters({ ...filters, campeonato: e.target.value })}
            className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
          >
            <option value="">Todos</option>
            {campeonatos.map((c) => (
              <option key={c} value={c}>
                {translateLeagueName(c)}
              </option>
            ))}
          </select>
        </label>
        <p className="ml-auto text-sm text-stone-500">{filtered.length} registros</p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-700 py-16 text-center text-stone-500">
          Nenhum registro encontrado com estes filtros.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-800/90 bg-stone-950/80 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Salvo em</th>
                  <th className="px-4 py-3">Jogo</th>
                  <th className="px-4 py-3">Campeonato</th>
                  <th className="px-4 py-3">Mercado</th>
                  <th className="px-4 py-3 text-right">Odd</th>
                  <th className="min-w-[130px] px-4 py-3">Prob.</th>
                  <th className="px-4 py-3 text-right">Vantagem</th>
                  <th className="px-4 py-3 text-right">EV</th>
                  <th className="px-4 py-3">Nível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gold-500/[0.03]">
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {format(new Date(row.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{row.jogo}</p>
                      {row.kickoff_at && (
                        <p className="text-xs text-stone-600">
                          {translateStatus("Kickoff")}{" "}
                          {format(new Date(row.kickoff_at), "dd MMM HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {translateLeagueName(row.campeonato)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-stone-800/80 px-2 py-1 text-xs text-gold-200/90">
                        {translateMarketName(row.mercado)}
                      </span>
                      {row.bookmaker && (
                        <p className="mt-1 text-[10px] text-stone-600">{row.bookmaker}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">
                      {Number(row.odd).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <ProbabilityBar
                        real={Number(row.probabilidade_real)}
                        implied={Number(row.probabilidade_implicita)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-300">
                      {Number(row.edge) >= 0 ? "+" : ""}
                      {Number(row.edge).toFixed(1)} pp
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold tabular-nums",
                        Number(row.ev) >= 0.03
                          ? "text-emerald-400"
                          : Number(row.ev) < 0
                            ? "text-red-400"
                            : "text-stone-400",
                      )}
                    >
                      {formatEv(Number(row.ev))}
                    </td>
                    <td className="px-4 py-3">
                      <EVBadge tier={row.tier as EvTier} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
