import { formatKickoffPt, todayDateBrazil } from "@/lib/api-football/dates";
import { generateMarketInsight } from "@/lib/betting/ev-engine";
import {
  getRecentMarketBoardSnapshotRows,
  refreshMarketBoardSnapshotCache,
} from "@/lib/betting/market-ev-snapshots";
import {
  MARKET_BOARD_LIMIT,
  type BoardMarketLabel,
  type MarketBoardResult,
  type MarketBoardRow,
} from "@/lib/betting/market-board-types";
import { translateLeagueName, translateStatus } from "@/lib/i18n/market-ptbr";
import { fetchSportOddsEvents, getOddsApiKey } from "@/services/the-odds-api";
import type { OddsFixtureEvent } from "@/services/the-odds-api.types";

const MARKET_BOARD_CACHE_MS = 30 * 60 * 1000;
const MARKET_BOARD_SPORT_KEYS = ["soccer_brazil_campeonato"] as const;
const MARKET_BOARD_MARKETS = "h2h";

type BestQuote = { odd: number; bookmaker: string };

function sportKeysFromEnv(): string[] {
  return [...MARKET_BOARD_SPORT_KEYS];
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
    league: translateLeagueName(event.sportTitle ?? event.sportKey, event.sportKey),
    country: event.sportKey,
    kickoffLabel: event.commenceTime
      ? `${translateStatus("Kickoff")} ${formatKickoffPt(event.commenceTime)}`
      : "-",
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
  const cachedRows = await getRecentMarketBoardSnapshotRows(MARKET_BOARD_CACHE_MS, limit);
  if (cachedRows.length > 0) {
    return {
      ok: true,
      rows: cachedRows,
      meta: {
        date,
        fixturesTotal: cachedRows.length,
        fixturesMatched: cachedRows.length,
        oddsEventsTotal: cachedRows.length,
        rowsBeforeLimit: cachedRows.length,
        sportKeys: sportKeysFromEnv(),
        warnings: ["Central EV+ carregada do cache salvo (30 min)."],
      },
    };
  }

  if (!getOddsApiKey()) {
    return { ok: false, error: "ODDS_API_KEY ausente" };
  }

  const sportKeys = sportKeysFromEnv();
  const oddsResults = await Promise.all(
    sportKeys.map((key) => fetchSportOddsEvents(key, MARKET_BOARD_MARKETS)),
  );
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
    addMarketRow(rows, event, "Vitória Mandante", collectH2H(event, event.homeTeam));
    addMarketRow(rows, event, "Vitória Visitante", collectH2H(event, event.awayTeam));
  }

  const sorted = rows.sort((a, b) => b.ev - a.ev);
  const limited = sorted.slice(0, limit);

  console.warn(`[MARKET BOARD] oddsEvents: ${oddsEvents.length} rows: ${rows.length}`);
  await refreshMarketBoardSnapshotCache(rows);

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

