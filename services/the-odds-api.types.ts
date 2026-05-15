/** Tipagens normalizadas para The Odds API v4. */

export type TheOddsApiUsage = {
  requestsRemaining: number | null;
  requestsUsed: number | null;
  requestsLast: number | null;
};

export type OddsOutcome = {
  name: string;
  price: number;
  point?: number | null;
};

export type OddsMarket = {
  key: string;
  lastUpdate: string | null;
  outcomes: OddsOutcome[];
};

export type OddsBookmaker = {
  key: string;
  title: string;
  lastUpdate: string | null;
  markets: OddsMarket[];
};

/** Evento com odds completas (fixture na terminologia The Odds API). */
export type OddsFixtureEvent = {
  id: string;
  sportKey: string;
  sportTitle: string | null;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: OddsBookmaker[];
};

/** Mercado disponível por casa (endpoint /events/{id}/markets). */
export type OddsMarketAvailability = {
  key: string;
  lastUpdate: string | null;
};

export type OddsBookmakerMarkets = {
  key: string;
  title: string;
  markets: OddsMarketAvailability[];
};

export type OddsMarketsSnapshot = {
  eventId: string;
  sportKey: string;
  bookmakers: OddsBookmakerMarkets[];
};

export type GetOddsByFixtureParams = {
  sportKey: string;
  eventId: string;
  regions?: string;
  markets?: string;
  oddsFormat?: "decimal" | "american";
};

export type GetMarketsParams = {
  sportKey: string;
  eventId: string;
  regions?: string;
};

export type GetBookmakersParams = {
  sportKey: string;
  eventId?: string;
  regions?: string;
  markets?: string;
};

export type TheOddsApiSuccess<T> = {
  ok: true;
  data: T;
  usage: TheOddsApiUsage;
};

export type TheOddsApiFailure = {
  ok: false;
  error: string;
  status?: number;
};

export type TheOddsApiResult<T> = TheOddsApiSuccess<T> | TheOddsApiFailure;

/** Resumo para testes / UI futura. */
export type OddsMoneylineQuote = {
  bookmakerKey: string;
  bookmakerTitle: string;
  outcomes: OddsOutcome[];
};

export type OddsOverUnderQuote = {
  bookmakerKey: string;
  bookmakerTitle: string;
  point: number | null;
  over: OddsOutcome | null;
  under: OddsOutcome | null;
};

export type OddsMainLines = {
  moneyline: OddsMoneylineQuote[];
  overUnder: OddsOverUnderQuote[];
  spreads: {
    bookmakerKey: string;
    bookmakerTitle: string;
    outcomes: OddsOutcome[];
  }[];
};
