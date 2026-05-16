import type { EvTier } from "@/lib/betting/ev-engine";

export const MARKET_BOARD_LIMIT = 30;

export const BOARD_MARKET_LABELS = [
  "Vitória Mandante",
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
