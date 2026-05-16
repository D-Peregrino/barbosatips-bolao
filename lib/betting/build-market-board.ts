import { fetchFixturesByDate, getApiFootballKey, todayDateBrazil } from "@/lib/api-football/client";
import { computeMatchTrends, computeTeamForm } from "@/lib/api-football/form-trends";
import { fetchTeamLastFixtures } from "@/lib/api-football/team-fixtures";
import type {
  ApiFootballRawFixture,
  FootballFixtureSummary,
  TeamRecentForm,
} from "@/lib/api-football/types";
import { generateMarketInsight } from "@/lib/betting/ev-engine";
import type { EvTier } from "@/lib/betting/ev-engine";
import {
  findOddsEventForFixture,
  formatMatchDebugNoEvent,
  teamsMatch,
} from "@/lib/betting/match-football-odds";
import { fetchSportOddsEvents, getOddsApiKey } from "@/services/the-odds-api";
import type { OddsFixtureEvent } from "@/services/the-odds-api.types";

export const MARKET_BOARD_LIMIT = 30;

export const BOARD_MARKET_LABELS = [
  "Over 2.5",
  "Home Win",
  "Away Win",
] as const;

export type BoardMarketLabel = (typeof BOARD_MARKET_LABELS)[number];

export type MarketBoardRow = {
  id: string;
  fixtureId: number;
  oddsEventId: string | null;
  matchLabel: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  kickoffLabel: string;
  kickoffAtIso: string | null;
  marketLabel: BoardMarketLabel;
  marketOdd: number;
  fairOdd: number;
  realProbability: number;
  impliedProbability: number;
  edge: number;
  ev: number;
  tier: EvTier;
  bookmaker: string | null;
};

export type MarketBoardMeta = {
  date: string;
  fixturesTotal: number;
  fixturesMatched: number;
  oddsEventsTotal: number;
  rowsBeforeLimit: number;
  sportKeys: string[];
  warnings: string[];
};

export type MarketBoardResult =
  | { ok: true; rows: MarketBoardRow[]; meta: MarketBoardMeta }
  | { ok: false; error: string };

const DEFAULT_SPORT_KEYS = [
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "soccer_brazil_campeonato",
  "soccer_uefa_champs_league",
];

function sportKeysFromEnv(): string[] {
  const raw = process.env.MARKET_BOARD_SPORT_KEYS?.trim();
  if (!raw) return DEFAULT_SPORT_KEYS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidDecimalOdd(price: number): boolean {
  return Number.isFinite(price) && price > 1 && price < 100;
}

function outcomeMatchesTeam(outcomeName: string, teamName: string): boolean {
  return teamsMatch(outcomeName, teamName);
}

type BestQuote = { odd: number; bookmaker: string };

function pickBest(quotes: BestQuote[]): BestQuote | null {
  if (quotes.length === 0) return null;
  return quotes.reduce((a, b) => (b.odd > a.odd ? b : a));
}

function collectH2H(event: OddsFixtureEvent, teamName: string): BestQuote | null {
  const quotes: BestQuote[] = [];
  for (const bm of event.bookmakers) {
    for (const market of bm.markets) {
      if (market.key !== "h2h") continue;
      for (const o of market.outcomes) {
        if (outcomeMatchesTeam(o.name, teamName) && isValidDecimalOdd(o.price)) {
          quotes.push({ odd: o.price, bookmaker: bm.title });
        }
      }
    }
  }
  return pickBest(quotes);
}

function collectOver25(event: OddsFixtureEvent): BestQuote | null {
  const quotes: BestQuote[] = [];
  for (const bm of event.bookmakers) {
    for (const market of bm.markets) {
      if (market.key !== "totals") continue;
      for (const o of market.outcomes) {
        if (!/^over/i.test(o.name)) continue;
        if (o.point != null && Math.abs(o.point - 2.5) > 0.01) continue;
        if (isValidDecimalOdd(o.price)) {
          quotes.push({ odd: o.price, bookmaker: bm.title });
        }
      }
    }
  }
  return pickBest(quotes);
}

function winRatePct(form: TeamRecentForm): number | null {
  const total = form.wins + form.draws + form.losses;
  if (total === 0) return null;
  return Math.round((form.wins / total) * 100);
}

function dedupeFixtures(fixtures: ApiFootballRawFixture[]) {
  const seen = new Set<number>();
  const out: ApiFootballRawFixture[] = [];
  for (const f of fixtures) {
    const id = f.fixture?.id;
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    out.push(f);
  }
  return out;
}

async function loadTrendsForFixture(fixture: FootballFixtureSummary) {
  const homeId = fixture.homeTeamId;
  const awayId = fixture.awayTeamId;
  if (!homeId || !awayId) return null;

  const [homeLast, awayLast] = await Promise.all([
    fetchTeamLastFixtures(homeId, 5),
    fetchTeamLastFixtures(awayId, 5),
  ]);

  const pool = dedupeFixtures([...homeLast, ...awayLast]);
  const trends = computeMatchTrends(pool);
  const homeForm = computeTeamForm(homeLast, homeId);
  const awayForm = computeTeamForm(awayLast, awayId);

  return { trends, homeForm, awayForm };
}

function tryAddRow(
  rows: MarketBoardRow[],
  params: {
    fixture: FootballFixtureSummary;
    oddsEvent: OddsFixtureEvent;
    marketLabel: BoardMarketLabel;
    realProbability: number | null;
    quote: BestQuote | null;
  },
) {
  const { fixture, oddsEvent, marketLabel, realProbability, quote } = params;
  if (realProbability == null || realProbability <= 0 || realProbability >= 100) return;
  if (!quote || !isValidDecimalOdd(quote.odd)) return;

  try {
    const insight = generateMarketInsight({
      marketLabel,
      realProbability,
      marketOdd: quote.odd,
    });

    rows.push({
      id: `${fixture.fixtureId}-${marketLabel.replace(/\s+/g, "-").toLowerCase()}`,
      fixtureId: fixture.fixtureId,
      oddsEventId: oddsEvent.id,
      matchLabel: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.leagueName,
      country: fixture.country,
      kickoffLabel: fixture.kickoffLabel,
      kickoffAtIso: fixture.dateIso || null,
      marketLabel,
      marketOdd: insight.marketOdd,
      fairOdd: insight.fairOdd,
      realProbability: insight.realProbability,
      impliedProbability: insight.impliedProbability,
      edge: insight.edge,
      ev: insight.ev,
      tier: insight.tier,
      bookmaker: quote.bookmaker,
    });
  } catch {
    /* odd ou probabilidade inválida */
  }
}

export async function buildMarketBoard(options?: {
  date?: string;
  limit?: number;
}): Promise<MarketBoardResult> {
  const date = options?.date ?? todayDateBrazil();
  const limit = options?.limit ?? MARKET_BOARD_LIMIT;
  const warnings: string[] = [];

  if (!getApiFootballKey()) {
    return { ok: false, error: "API_FOOTBALL_KEY ausente" };
  }
  if (!getOddsApiKey()) {
    return { ok: false, error: "ODDS_API_KEY ausente" };
  }

  const fixturesResult = await fetchFixturesByDate(date);
  if (!fixturesResult.ok) {
    return { ok: false, error: fixturesResult.error };
  }

  const sportKeys = sportKeysFromEnv();
  const oddsResults = await Promise.all(sportKeys.map((key) => fetchSportOddsEvents(key)));
  const allOddsEvents: OddsFixtureEvent[] = [];
  for (const r of oddsResults) {
    if (r.ok) allOddsEvents.push(...r.data);
    else warnings.push(`Odds ${r.error}`);
  }

  if (allOddsEvents.length === 0) {
    return {
      ok: false,
      error: "Nenhum evento com odds encontrado nas ligas configuradas",
    };
  }

  const rows: MarketBoardRow[] = [];
  let matched = 0;
  const matchDebug = process.env.MARKET_BOARD_MATCH_DEBUG === "1";
  let matchDebugLines = 0;
  const maxMatchDebugFixtures = 10;

  for (const fixture of fixturesResult.fixtures) {
    const oddsEvent = findOddsEventForFixture(fixture, allOddsEvents);
    if (!oddsEvent) {
      if (matchDebug && matchDebugLines < maxMatchDebugFixtures) {
        matchDebugLines += 1;
        for (const line of formatMatchDebugNoEvent(fixture, allOddsEvents)) {
          console.warn(line);
        }
      }
      continue;
    }
    matched += 1;

    const trendData = await loadTrendsForFixture(fixture);
    if (!trendData) continue;

    const { trends, homeForm, awayForm } = trendData;
    const homeWinPct = winRatePct(homeForm);
    const awayWinPct = winRatePct(awayForm);

    tryAddRow(rows, {
      fixture,
      oddsEvent,
      marketLabel: "Over 2.5",
      realProbability: trends.sampleSize > 0 ? trends.over25Pct : null,
      quote: collectOver25(oddsEvent),
    });

    tryAddRow(rows, {
      fixture,
      oddsEvent,
      marketLabel: "Home Win",
      realProbability: homeWinPct,
      quote: collectH2H(oddsEvent, fixture.homeTeam),
    });

    tryAddRow(rows, {
      fixture,
      oddsEvent,
      marketLabel: "Away Win",
      realProbability: awayWinPct,
      quote: collectH2H(oddsEvent, fixture.awayTeam),
    });
  }

  const sorted = rows.sort((a, b) => b.ev - a.ev);
  const limited = sorted.slice(0, limit);

  return {
    ok: true,
    rows: limited,
    meta: {
      date,
      fixturesTotal: fixturesResult.fixtures.length,
      fixturesMatched: matched,
      oddsEventsTotal: allOddsEvents.length,
      rowsBeforeLimit: sorted.length,
      sportKeys,
      warnings,
    },
  };
}

export function buildMarketAnalysisHref(row: MarketBoardRow): string {
  const params = new URLSearchParams({
    fixtureId: String(row.fixtureId),
    home: row.homeTeam,
    away: row.awayTeam,
    league: row.league,
    country: row.country,
    mercado: row.marketLabel,
    odd: String(row.marketOdd),
    probabilidade: String(row.realProbability),
    ev: String(row.ev),
  });
  return `/admin-editorial/nova?${params.toString()}`;
}
