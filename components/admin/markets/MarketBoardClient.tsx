"use client";

import { useMemo, useState } from "react";
import {
  MarketFilters,
  type MarketFilterState,
} from "@/components/admin/markets/MarketFilters";
import { MarketBoardTable } from "@/components/admin/markets/MarketBoardTable";
import { MarketSnapshotToolbar } from "@/components/admin/markets/MarketSnapshotToolbar";
import type { MarketBoardMeta, MarketBoardRow } from "@/lib/betting/build-market-board";
import type { MarketEvSnapshotSummary } from "@/lib/betting/market-ev-snapshots";
import type { EvTier } from "@/lib/betting/ev-engine";

type Props = {
  rows: MarketBoardRow[];
  meta: MarketBoardMeta;
  snapshotSummary: MarketEvSnapshotSummary;
};

const EMPTY_FILTERS: MarketFilterState = {
  league: "",
  tier: "",
  market: "",
};

export function MarketBoardClient({ rows, meta, snapshotSummary }: Props) {
  const [filters, setFilters] = useState<MarketFilterState>(EMPTY_FILTERS);

  const leagues = useMemo(() => {
    const set = new Set(rows.map((r) => r.league));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (filters.league && row.league !== filters.league) return false;
      if (filters.tier && row.tier !== (filters.tier as EvTier)) return false;
      if (filters.market && row.marketLabel !== filters.market) return false;
      return true;
    });
  }, [rows, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-xs text-stone-500">
        <span>Data: {meta.date}</span>
        <span>·</span>
        <span>
          {meta.fixturesMatched}/{meta.fixturesTotal} jogos cruzados
        </span>
        <span>·</span>
        <span>{meta.oddsEventsTotal} eventos odds</span>
        <span>·</span>
        <span>Top {rows.length} por EV</span>
      </div>

      <MarketSnapshotToolbar summary={snapshotSummary} />

      {meta.warnings.length > 0 && (
        <ul className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-2 text-xs text-amber-200/90">
          {meta.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <MarketFilters
        leagues={leagues}
        value={filters}
        onChange={setFilters}
        totalCount={rows.length}
        filteredCount={filtered.length}
      />

      <MarketBoardTable rows={filtered} />
    </div>
  );
}
