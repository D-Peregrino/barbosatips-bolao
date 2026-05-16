import { formatKickoffPt, todayDateBrazil } from "@/lib/api-football/dates";
import type { BoardMarketLabel, MarketBoardRow } from "@/lib/betting/market-board-types";
import type { EvTier } from "@/lib/betting/ev-engine";
import { translateLeagueName, translateMarketName, translateStatus } from "@/lib/i18n/market-ptbr";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export type MarketEvSnapshotRow = {
  id: string;
  fixture_id: string;
  jogo: string;
  campeonato: string;
  mercado: string;
  odd: number;
  probabilidade_real: number;
  probabilidade_implicita: number;
  fair_odd: number;
  edge: number;
  ev: number;
  tier: string;
  bookmaker: string;
  kickoff_at: string | null;
  source: string;
  snapshot_date: string;
  created_at: string;
};

export type MarketEvSnapshotSummary = {
  lastSavedAt: string | null;
  savedTodayCount: number;
  snapshotDate: string;
};

export type SaveMarketEvSnapshotResult =
  | {
      ok: true;
      inserted: number;
      skipped: number;
      snapshotDate: string;
      savedAt: string;
    }
  | { ok: false; error: string };

export type ListMarketEvSnapshotsFilters = {
  date?: string;
  tier?: string;
  mercado?: string;
  campeonato?: string;
  limit?: number;
};

function snapshotDateBrazil(): string {
  return todayDateBrazil();
}

function rowToInsert(row: MarketBoardRow, snapshotDate: string, createdAt?: string) {
  const base = {
    fixture_id: String(row.fixtureId),
    jogo: row.matchLabel,
    campeonato: row.league,
    mercado: row.marketLabel,
    odd: row.marketOdd,
    probabilidade_real: row.realProbability,
    probabilidade_implicita: row.impliedProbability,
    fair_odd: row.fairOdd,
    edge: row.edge,
    ev: row.ev,
    tier: row.tier,
    bookmaker: row.bookmaker?.trim() || "",
    kickoff_at: row.kickoffAtIso || null,
    source: "market_board",
    snapshot_date: snapshotDate,
  };
  return createdAt ? { ...base, created_at: createdAt } : base;
}

function fallbackFixtureId(value: string): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function toBoardMarketLabel(value: string): BoardMarketLabel | null {
  const translated = translateMarketName(value);
  if (translated === "Vitória Mandante" || translated === "Vitória Visitante") {
    return translated;
  }
  return null;
}

function snapshotRowToBoardRow(row: MarketEvSnapshotRow): MarketBoardRow | null {
  const marketLabel = toBoardMarketLabel(row.mercado);
  const league = translateLeagueName(row.campeonato);
  if (!marketLabel || league !== "Brasileirão Série A") return null;

  const [homeTeam = row.jogo, awayTeam = ""] = row.jogo.split(/\s+vs\s+/i);
  const kickoffAtIso = row.kickoff_at || null;

  return {
    id: `${row.fixture_id}-${row.mercado}-${row.bookmaker}`,
    fixtureId: fallbackFixtureId(row.fixture_id),
    oddsEventId: row.fixture_id,
    matchLabel: row.jogo,
    homeTeam,
    awayTeam,
    league,
    country: "soccer_brazil_campeonato",
    kickoffLabel: kickoffAtIso
      ? `${translateStatus("Kickoff")} ${formatKickoffPt(kickoffAtIso)}`
      : "-",
    kickoffAtIso,
    marketLabel,
    marketOdd: Number(row.odd),
    fairOdd: Number(row.fair_odd),
    realProbability: Number(row.probabilidade_real),
    impliedProbability: Number(row.probabilidade_implicita),
    edge: Number(row.edge),
    ev: Number(row.ev),
    tier: row.tier as EvTier,
    bookmaker: row.bookmaker || null,
  };
}

export async function getMarketEvSnapshotSummary(): Promise<MarketEvSnapshotSummary> {
  const snapshotDate = snapshotDateBrazil();
  if (shouldSkipLiveSupabase()) {
    return { lastSavedAt: null, savedTodayCount: 0, snapshotDate };
  }

  try {
    const admin = createAdminClient();
    const { data: lastRow } = await admin
      .from("market_ev_snapshots")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count } = await admin
      .from("market_ev_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("snapshot_date", snapshotDate);

    return {
      lastSavedAt: lastRow?.created_at ?? null,
      savedTodayCount: count ?? 0,
      snapshotDate,
    };
  } catch {
    return { lastSavedAt: null, savedTodayCount: 0, snapshotDate };
  }
}

export async function saveMarketEvSnapshots(
  rows: MarketBoardRow[],
): Promise<SaveMarketEvSnapshotResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }
  if (rows.length === 0) {
    return { ok: false, error: "Nenhum mercado para guardar." };
  }

  const snapshotDate = snapshotDateBrazil();
  const payload = rows.map((r) => rowToInsert(r, snapshotDate));

  try {
    const admin = createAdminClient();

    const fixtureIds = Array.from(new Set(payload.map((p) => p.fixture_id)));
    const { data: existing } = await admin
      .from("market_ev_snapshots")
      .select("fixture_id, mercado, bookmaker")
      .eq("snapshot_date", snapshotDate)
      .in("fixture_id", fixtureIds);

    const existingKeys = new Set(
      (existing ?? []).map((e) => `${e.fixture_id}|${e.mercado}|${e.bookmaker ?? ""}`),
    );

    const toInsert = payload.filter((p) => {
      const key = `${p.fixture_id}|${p.mercado}|${p.bookmaker}`;
      return !existingKeys.has(key);
    });

    const skipped = payload.length - toInsert.length;

    if (toInsert.length === 0) {
      const summary = await getMarketEvSnapshotSummary();
      return {
        ok: true,
        inserted: 0,
        skipped,
        snapshotDate,
        savedAt: summary.lastSavedAt ?? new Date().toISOString(),
      };
    }

    const { error } = await admin.from("market_ev_snapshots").insert(toInsert);
    if (error) {
      console.error("saveMarketEvSnapshots", error);
      return { ok: false, error: "Não foi possível salvar o registro." };
    }

    const savedAt = new Date().toISOString();
    return {
      ok: true,
      inserted: toInsert.length,
      skipped,
      snapshotDate,
      savedAt,
    };
  } catch (err) {
    console.error("saveMarketEvSnapshots", err);
    return { ok: false, error: "Erro ao contatar o Supabase." };
  }
}

export async function getRecentMarketBoardSnapshotRows(
  maxAgeMs: number,
  limit = 30,
): Promise<MarketBoardRow[]> {
  if (shouldSkipLiveSupabase()) return [];

  const since = new Date(Date.now() - maxAgeMs).toISOString();

  try {
    const admin = createAdminClient();
    const queryLimit = Math.max(limit * 10, 200);
    const { data, error } = await admin
      .from("market_ev_snapshots")
      .select("*")
      .eq("source", "market_board")
      .gte("created_at", since)
      .order("ev", { ascending: false })
      .limit(queryLimit);

    if (error) return [];

    return ((data ?? []) as MarketEvSnapshotRow[])
      .map(snapshotRowToBoardRow)
      .filter((row): row is MarketBoardRow => row != null)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function refreshMarketBoardSnapshotCache(
  rows: MarketBoardRow[],
): Promise<void> {
  if (shouldSkipLiveSupabase() || rows.length === 0) return;

  const snapshotDate = snapshotDateBrazil();
  const createdAt = new Date().toISOString();
  const payload = rows.map((row) => rowToInsert(row, snapshotDate, createdAt));

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("market_ev_snapshots")
      .upsert(payload, {
        onConflict: "fixture_id,mercado,bookmaker,snapshot_date",
      });

    if (error) {
      console.error("refreshMarketBoardSnapshotCache", error);
    }
  } catch (err) {
    console.error("refreshMarketBoardSnapshotCache", err);
  }
}

export async function listMarketEvSnapshots(
  filters: ListMarketEvSnapshotsFilters = {},
): Promise<MarketEvSnapshotRow[]> {
  if (shouldSkipLiveSupabase()) return [];

  const limit = filters.limit ?? 200;

  try {
    const admin = createAdminClient();
    let query = admin
      .from("market_ev_snapshots")
      .select("*")
      .order("ev", { ascending: false })
      .limit(limit);

    if (filters.date) {
      query = query.eq("snapshot_date", filters.date);
    }
    if (filters.tier) {
      query = query.eq("tier", filters.tier);
    }
    if (filters.mercado) {
      query = query.eq("mercado", filters.mercado);
    }
    if (filters.campeonato) {
      query = query.eq("campeonato", filters.campeonato);
    }

    const { data, error } = await query;
    if (error) {
      console.error("listMarketEvSnapshots", error);
      return [];
    }

    return (data ?? []) as MarketEvSnapshotRow[];
  } catch {
    return [];
  }
}

export async function listSnapshotDates(): Promise<string[]> {
  if (shouldSkipLiveSupabase()) return [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("market_ev_snapshots")
      .select("snapshot_date")
      .order("snapshot_date", { ascending: false })
      .limit(60);

    if (error) return [];

    const dates = new Set<string>();
    for (const row of data ?? []) {
      if (row.snapshot_date) dates.add(row.snapshot_date);
    }
    return Array.from(dates);
  } catch {
    return [];
  }
}
