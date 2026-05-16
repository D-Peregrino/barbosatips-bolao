"use client";

import { Filter } from "lucide-react";
import { BOARD_MARKET_LABELS } from "@/lib/betting/build-market-board";
import type { EvTier } from "@/lib/betting/ev-engine";
import { cn } from "@/lib/utils";

const TIERS: EvTier[] = ["elite", "forte", "moderado", "neutro", "negativo"];

export type MarketFilterState = {
  league: string;
  tier: string;
  market: string;
};

type Props = {
  leagues: string[];
  value: MarketFilterState;
  onChange: (value: MarketFilterState) => void;
  totalCount: number;
  filteredCount: number;
};

export function MarketFilters({
  leagues,
  value,
  onChange,
  totalCount,
  filteredCount,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gold-400/12 bg-[#0c0b09]/80 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400/90">
        <Filter className="h-4 w-4" aria-hidden />
        Filtros
      </div>
      <label className="block min-w-[140px]">
        <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
          Campeonato
        </span>
        <select
          value={value.league}
          onChange={(e) => onChange({ ...value, league: e.target.value })}
          className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos</option>
          {leagues.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-[120px]">
        <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
          Tier EV
        </span>
        <select
          value={value.tier}
          onChange={(e) => onChange({ ...value, tier: e.target.value })}
          className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-[120px]">
        <span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-500">
          Mercado
        </span>
        <select
          value={value.market}
          onChange={(e) => onChange({ ...value, market: e.target.value })}
          className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos</option>
          {BOARD_MARKET_LABELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <p className={cn("ml-auto text-sm text-stone-500")}>
        {filteredCount} de {totalCount} mercados
      </p>
    </div>
  );
}
