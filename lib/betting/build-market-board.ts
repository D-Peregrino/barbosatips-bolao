import { formatKickoffPt, todayDateBrazil } from "@/lib/api-football/dates";
import { generateMarketInsight } from "@/lib/betting/ev-engine";
import type { EvTier } from "@/lib/betting/ev-engine";
import { fetchSportOddsEvents, getOddsApiKey } from "@/services/the-odds-api";
import type { OddsFixtureEvent } from "@/services/the-odds-api.types";

export const MARKET_BOARD_LIMIT = 30;

export const BOARD_MARKET_LABELS = [
  "Mais de 2.5 gols",
  "Vitória Casa",
  "Vitória Visitante",
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

type BestQuote = { odd: number; bookmaker: string };

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

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function outcomeMatchesTeam(outcomeName: string, teamName: string): boolean {
  return normalizeName(outcomeName) === normalizeName(teamName);
}

function pickBest(quotes: BestQuote[]): BestQuote | null {
  if (quotes.length === 0) return null;
  return quotes.reduce((a, b) => (b.odd > a.odd ? b : a));
}

function collectH2H(event: OddsFixtureEvent, teamName: string): BestQuote | null {
  const quotes: BestQuote[] = [];
  for (const bookmaker of event.bookmakers) {
    for (const market of bookmaker.markets) {
      if (market.key !== "h2h") continue;
      for (const outcome of market.outcomes) {
        if (outcomeMatchesTeam(outcome.name, teamName) && isValidDecimalOdd(outcome.price)) {
          quotes.push({ odd: outcome.price, bookmaker: bookmaker.title });
        }
      }
    }
  }
  return pickBest(quotes);
}

function collectOver25(event: OddsFixtureEvent): BestQuote | null {
  const quotes: BestQuote[] = [];
  for (const bookmaker of event.bookmakers) {
    for (const market of bookmaker.markets) {
      if (market.key !== "totals") continue;
      for (const outcome of market.outcomes) {
        if (!/^over/i.test(outcome.name)) continue;
        if (outcome.point == null || Math.abs(outcome.point - 2.5) > 0.01) continue;
        if (isValidDecimalOdd(outcome.price)) {
          quotes.push({ odd: outcome.price, bookmaker: bookmaker.title });
        }
      }
    }
  }
  return pickBest(quotes);
}

function provisionalProbabilityFromOdd(odd: number): number {
  return Math.min(85, (100 / odd) * 1.08);
}

function hashStringToPositiveInt(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function marketSlug(marketLabel: BoardMarketLabel): string {
  return marketLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function addMarketRow(
  rows: MarketBoardRow[],
  event: OddsFixtureEvent,
  marketLabel: BoardMarketLabel,
  quote: BestQuote | null,
) {
  if (!quote || !isValidDecimalOdd(quote.odd)) return;

  const realProbability = provisionalProbabilityFromOdd(quote.odd);
  const insight = generateMarketInsight({
    marketLabel,
    realProbability,
    marketOdd: quote.odd,
  });
  const fixtureId = hashStringToPositiveInt(event.id);

  rows.push({
    id: `${event.id}-${marketSlug(marketLabel)}-${quote.bookmaker}`,
    fixtureId,
    oddsEventId: event.id,
    matchLabel: `${event.homeTeam} vs ${event.awayTeam}`,
    homeTeam: event.homeTeam,
    awayTeam: event.awayTeam,
    league: event.sportTitle ?? event.sportKey,
    country: event.sportKey,
    kickoffLabel: event.commenceTime ? formatKickoffPt(event.commenceTime) : "-",
    kickoffAtIso: event.commenceTime || null,
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
}

function dedupeOddsEvents(events: OddsFixtureEvent[]): OddsFixtureEvent[] {
  const seen = new Set<string>();
  const out: OddsFixtureEvent[] = [];
  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    out.push(event);
  }
  return out;
}

export async function buildMarketBoard(options?: {
  date?: string;
  limit?: number;
}): Promise<MarketBoardResult> {
  const date = options?.date ?? todayDateBrazil();
  const limit = options?.limit ?? MARKET_BOARD_LIMIT;
  const warnings: string[] = [];

  if (!getOddsApiKey()) {
    return { ok: false, error: "ODDS_API_KEY ausente" };
  }

  const sportKeys = sportKeysFromEnv();
  const oddsResults = await Promise.all(sportKeys.map((key) => fetchSportOddsEvents(key)));
  const allOddsEvents: OddsFixtureEvent[] = [];
  for (const result of oddsResults) {
    if (result.ok) {
      allOddsEvents.push(...result.data);
    } else {
      warnings.push(`Odds ${result.error}`);
    }
  }

  const oddsEvents = dedupeOddsEvents(allOddsEvents);
  const rows: MarketBoardRow[] = [];

  for (const event of oddsEvents) {
    addMarketRow(rows, event, "Vitória Casa", collectH2H(event, event.homeTeam));
    addMarketRow(rows, event, "Vitória Visitante", collectH2H(event, event.awayTeam));
    addMarketRow(rows, event, "Mais de 2.5 gols", collectOver25(event));
  }

  const sorted = rows.sort((a, b) => b.ev - a.ev);
  const limited = sorted.slice(0, limit);

  console.warn(`[MARKET BOARD] oddsEvents: ${oddsEvents.length} rows: ${rows.length}`);

  return {
    ok: true,
    rows: limited,
    meta: {
      date,
      fixturesTotal: oddsEvents.length,
      fixturesMatched: oddsEvents.length,
      oddsEventsTotal: oddsEvents.length,
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
