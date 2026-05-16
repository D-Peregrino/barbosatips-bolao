import { fetchFixtureById, getApiFootballKey } from "@/lib/api-football/client";
import type { FootballFixtureSummary } from "@/lib/api-football/types";
import {
  isFixtureFinishedForSettlement,
  isFixtureVoid,
  settleEvMarket,
} from "@/lib/betting/market-ev-settlement";
import type { MarketEvSnapshotRow } from "@/lib/betting/market-ev-snapshots";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { subDays } from "date-fns";

export type MarketEvResultRow = {
  id: string;
  snapshot_id: string;
  fixture_id: string;
  mercado: string;
  odd: number;
  resultado: string;
  green: boolean;
  lucro: number;
  roi: number;
  created_at: string;
};

export type RefreshMarketEvResultsResult =
  | {
      ok: true;
      processed: number;
      settled: number;
      skipped: number;
      errors: string[];
    }
  | { ok: false; error: string };

export type MarketEvDashboardData = {
  totals: {
    totalBets: number;
    greens: number;
    reds: number;
    totalLucro: number;
    yieldPct: number;
  };
  roi7d: number;
  roi30d: number;
  roiByMercado: { mercado: string; lucro: number; bets: number; yieldPct: number }[];
  roiByTier: { tier: string; lucro: number; bets: number; yieldPct: number }[];
  cumulative: { idx: number; label: string; lucro: number; cumulative: number }[];
  distributionMercado: { mercado: string; greens: number; reds: number }[];
};

const BATCH_LIMIT = 100;
const SUPPORTED = new Set([
  "Over 2.5",
  "Mais de 2.5 gols",
  "BTTS",
  "Home Win",
  "Vitória Casa",
  "Vitória Mandante",
  "Away Win",
  "Vitória Visitante",
]);

async function listSnapshotsPendingSettlement(limit: number): Promise<MarketEvSnapshotRow[]> {
  const admin = createAdminClient();
  const { data: doneRows } = await admin.from("market_ev_results").select("snapshot_id");
  const done = new Set((doneRows ?? []).map((r) => r.snapshot_id as string));

  const { data: snaps, error } = await admin
    .from("market_ev_snapshots")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(800);

  if (error) return [];
  const list = (snaps ?? []) as MarketEvSnapshotRow[];
  return list.filter((s) => !done.has(s.id) && SUPPORTED.has(s.mercado)).slice(0, limit);
}

async function upsertResult(row: {
  snapshot_id: string;
  fixture_id: string;
  mercado: string;
  odd: number;
  resultado: string;
  green: boolean;
  lucro: number;
  roi: number;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("market_ev_results").upsert(row, {
    onConflict: "snapshot_id",
  });
  return error;
}

export async function refreshMarketEvResultsFromApi(): Promise<RefreshMarketEvResultsResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado." };
  }
  if (!getApiFootballKey()) {
    return { ok: false, error: "API_FOOTBALL_KEY ausente." };
  }

  const pending = await listSnapshotsPendingSettlement(BATCH_LIMIT);
  if (pending.length === 0) {
    return { ok: true, processed: 0, settled: 0, skipped: 0, errors: [] };
  }

  const fixtureCache = new Map<number, FootballFixtureSummary | null>();
  const errors: string[] = [];
  const missingFixture = new Set<string>();
  let settled = 0;
  let skipped = 0;

  async function loadFixture(fid: string): Promise<FootballFixtureSummary | null> {
    const id = Number.parseInt(fid, 10);
    if (!Number.isFinite(id)) return null;
    if (fixtureCache.has(id)) return fixtureCache.get(id) ?? null;
    const res = await fetchFixtureById(id);
    if (!res.ok) {
      fixtureCache.set(id, null);
      return null;
    }
    fixtureCache.set(id, res.fixture);
    return res.fixture;
  }

  for (const snap of pending) {
    const fixture = await loadFixture(snap.fixture_id);
    if (!fixture) {
      skipped += 1;
      if (!missingFixture.has(snap.fixture_id) && errors.length < 15) {
        missingFixture.add(snap.fixture_id);
        errors.push(`Fixture ${snap.fixture_id}: não encontrado`);
      }
      continue;
    }

    if (isFixtureVoid(fixture.statusShort)) {
      skipped += 1;
      continue;
    }

    if (!isFixtureFinishedForSettlement(fixture.statusShort)) {
      skipped += 1;
      continue;
    }

    const gh = fixture.goalsHome;
    const ga = fixture.goalsAway;
    if (gh == null || ga == null) {
      skipped += 1;
      continue;
    }

    const odd = Number(snap.odd);
    if (!Number.isFinite(odd) || odd <= 1) {
      skipped += 1;
      continue;
    }

    const settlement = settleEvMarket(snap.mercado, gh, ga, odd);
    const err = await upsertResult({
      snapshot_id: snap.id,
      fixture_id: snap.fixture_id,
      mercado: snap.mercado,
      odd,
      resultado: settlement.resultado,
      green: settlement.green,
      lucro: settlement.lucro,
      roi: settlement.roi,
    });

    if (err) {
      errors.push(`${snap.id}: ${err.message}`);
      skipped += 1;
    } else {
      settled += 1;
    }
  }

  return {
    ok: true,
    processed: pending.length,
    settled,
    skipped,
    errors: errors.slice(0, 20),
  };
}

function yieldPct(lucro: number, bets: number): number {
  if (bets <= 0) return 0;
  return Math.round((lucro / bets) * 10000) / 100;
}

export async function getMarketEvDashboardData(): Promise<MarketEvDashboardData> {
  const empty: MarketEvDashboardData = {
    totals: { totalBets: 0, greens: 0, reds: 0, totalLucro: 0, yieldPct: 0 },
    roi7d: 0,
    roi30d: 0,
    roiByMercado: [],
    roiByTier: [],
    cumulative: [],
    distributionMercado: [],
  };

  if (shouldSkipLiveSupabase()) return empty;

  try {
    const admin = createAdminClient();
    const { data: results, error } = await admin
      .from("market_ev_results")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(5000);

    if (error || !results?.length) return empty;

    const rows = results as MarketEvResultRow[];
    const snapshotIds = Array.from(new Set(rows.map((r) => r.snapshot_id)));
    const tierBySnapshot = new Map<string, string>();

    const chunk = 200;
    for (let i = 0; i < snapshotIds.length; i += chunk) {
      const slice = snapshotIds.slice(i, i + chunk);
      const { data: snaps } = await admin
        .from("market_ev_snapshots")
        .select("id, tier")
        .in("id", slice);
      for (const s of snaps ?? []) {
        tierBySnapshot.set(s.id as string, (s as { tier: string }).tier);
      }
    }

    const now = new Date();
    const t7 = subDays(now, 7).getTime();
    const t30 = subDays(now, 30).getTime();

    let greens = 0;
    let reds = 0;
    let totalLucro = 0;
    let lucro7 = 0;
    let bets7 = 0;
    let lucro30 = 0;
    let bets30 = 0;

    const byMercado = new Map<string, { lucro: number; bets: number; greens: number; reds: number }>();
    const byTier = new Map<string, { lucro: number; bets: number }>();

    let cum = 0;
    const cumulative: MarketEvDashboardData["cumulative"] = [];

    rows.forEach((r, idx) => {
      if (r.green) greens += 1;
      else reds += 1;
      totalLucro += r.lucro;

      const ts = new Date(r.created_at).getTime();
      if (ts >= t7) {
        lucro7 += r.lucro;
        bets7 += 1;
      }
      if (ts >= t30) {
        lucro30 += r.lucro;
        bets30 += 1;
      }

      const m = r.mercado;
      if (!byMercado.has(m)) {
        byMercado.set(m, { lucro: 0, bets: 0, greens: 0, reds: 0 });
      }
      const mm = byMercado.get(m)!;
      mm.lucro += r.lucro;
      mm.bets += 1;
      if (r.green) mm.greens += 1;
      else mm.reds += 1;

      const tier = tierBySnapshot.get(r.snapshot_id) ?? "unknown";
      if (!byTier.has(tier)) byTier.set(tier, { lucro: 0, bets: 0 });
      const tt = byTier.get(tier)!;
      tt.lucro += r.lucro;
      tt.bets += 1;

      cum += r.lucro;
      cumulative.push({
        idx: idx + 1,
        label: String(idx + 1),
        lucro: r.lucro,
        cumulative: Math.round(cum * 100) / 100,
      });
    });

    const totalBets = rows.length;
    const roiByMercado = Array.from(byMercado.entries()).map(([mercado, v]) => ({
      mercado,
      lucro: Math.round(v.lucro * 100) / 100,
      bets: v.bets,
      yieldPct: yieldPct(v.lucro, v.bets),
    }));

    const roiByTier = Array.from(byTier.entries()).map(([tier, v]) => ({
      tier,
      lucro: Math.round(v.lucro * 100) / 100,
      bets: v.bets,
      yieldPct: yieldPct(v.lucro, v.bets),
    }));

    const distributionMercado = Array.from(byMercado.entries()).map(([mercado, v]) => ({
      mercado,
      greens: v.greens,
      reds: v.reds,
    }));

    return {
      totals: {
        totalBets,
        greens,
        reds,
        totalLucro: Math.round(totalLucro * 100) / 100,
        yieldPct: yieldPct(totalLucro, totalBets),
      },
      roi7d: yieldPct(lucro7, bets7),
      roi30d: yieldPct(lucro30, bets30),
      roiByMercado: roiByMercado.sort((a, b) => b.lucro - a.lucro),
      roiByTier: roiByTier.sort((a, b) => b.lucro - a.lucro),
      cumulative,
      distributionMercado,
    };
  } catch {
    return empty;
  }
}
