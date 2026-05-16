/**
 * Cliente server-side The Odds API v4.
 * Chave: process.env.ODDS_API_KEY (nunca expor no frontend).
 */

import type {
  GetBookmakersParams,
  GetMarketsParams,
  GetOddsByFixtureParams,
  OddsBookmaker,
  OddsBookmakerMarkets,
  OddsFixtureEvent,
  OddsMainLines,
  OddsMarket,
  OddsMarketAvailability,
  OddsMarketsSnapshot,
  OddsOutcome,
  OddsOverUnderQuote,
  OddsMoneylineQuote,
  TheOddsApiResult,
  TheOddsApiUsage,
} from "@/services/the-odds-api.types";

export type {
  OddsBookmaker,
  OddsFixtureEvent,
  OddsMainLines,
  OddsMarket,
  OddsOutcome,
  OddsOverUnderQuote,
  OddsMoneylineQuote,
  OddsMarketsSnapshot,
  TheOddsApiResult,
  TheOddsApiUsage,
} from "@/services/the-odds-api.types";

const API_BASE = "https://api.the-odds-api.com/v4";

export const THE_ODDS_API_DEFAULTS = {
  regions: "eu",
  markets: "h2h,spreads,totals",
  /** Mercado usado pela Central EV+ para reduzir consumo de créditos. */
  boardMarkets: "h2h",
  oddsFormat: "decimal" as const,
  /** Liga usada no endpoint de teste quando não há query params. */
  testSportKey: "soccer_brazil_campeonato",
};

type RawOutcome = { name?: string; price?: number; point?: number | null };
type RawMarket = { key?: string; last_update?: string; outcomes?: RawOutcome[] };
type RawBookmaker = {
  key?: string;
  title?: string;
  last_update?: string;
  markets?: RawMarket[];
};
type RawEvent = {
  id?: string;
  sport_key?: string;
  sport_title?: string;
  commence_time?: string;
  home_team?: string;
  away_team?: string;
  bookmakers?: RawBookmaker[];
};
type RawMarketsBookmaker = {
  key?: string;
  title?: string;
  markets?: { key?: string; last_update?: string }[];
};
type RawMarketsEvent = {
  id?: string;
  sport_key?: string;
  bookmakers?: RawMarketsBookmaker[];
};

export function getOddsApiKey(): string | null {
  const key = process.env.ODDS_API_KEY?.trim();
  return key || null;
}

function parseUsage(res: Response): TheOddsApiUsage {
  const num = (h: string | null) => {
    if (h == null || h === "") return null;
    const n = Number(h);
    return Number.isFinite(n) ? n : null;
  };
  return {
    requestsRemaining: num(res.headers.get("x-requests-remaining")),
    requestsUsed: num(res.headers.get("x-requests-used")),
    requestsLast: num(res.headers.get("x-requests-last")),
  };
}

function mapOutcome(raw: RawOutcome): OddsOutcome | null {
  if (!raw.name || raw.price == null || !Number.isFinite(raw.price)) return null;
  return {
    name: raw.name,
    price: raw.price,
    point: raw.point ?? null,
  };
}

function mapMarket(raw: RawMarket): OddsMarket | null {
  if (!raw.key) return null;
  const outcomes = (raw.outcomes ?? [])
    .map(mapOutcome)
    .filter((o): o is OddsOutcome => o != null);
  return {
    key: raw.key,
    lastUpdate: raw.last_update ?? null,
    outcomes,
  };
}

function mapBookmaker(raw: RawBookmaker): OddsBookmaker | null {
  if (!raw.key || !raw.title) return null;
  const markets = (raw.markets ?? [])
    .map(mapMarket)
    .filter((m): m is OddsMarket => m != null);
  return {
    key: raw.key,
    title: raw.title,
    lastUpdate: raw.last_update ?? null,
    markets,
  };
}

function mapFixtureEvent(raw: RawEvent): OddsFixtureEvent | null {
  if (!raw.id || !raw.sport_key || !raw.home_team || !raw.away_team || !raw.commence_time) {
    return null;
  }
  const bookmakers = (raw.bookmakers ?? [])
    .map(mapBookmaker)
    .filter((b): b is OddsBookmaker => b != null);
  return {
    id: raw.id,
    sportKey: raw.sport_key,
    sportTitle: raw.sport_title ?? null,
    commenceTime: raw.commence_time,
    homeTeam: raw.home_team,
    awayTeam: raw.away_team,
    bookmakers,
  };
}

async function oddsApiFetch<T>(
  path: string,
  searchParams?: Record<string, string | undefined>,
): Promise<TheOddsApiResult<T>> {
  const apiKey = getOddsApiKey();
  if (!apiKey) {
    return { ok: false, error: "ODDS_API_KEY ausente", status: 503 };
  }

  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("apiKey", apiKey);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v != null && v !== "") url.searchParams.set(k, v);
    }
  }

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const usage = parseUsage(res);

    if (!res.ok) {
      let message = `The Odds API HTTP ${res.status}`;
      try {
        const errBody = (await res.json()) as { message?: string };
        if (errBody.message) message = errBody.message;
      } catch {
        /* ignore */
      }
      return { ok: false, error: message, status: res.status };
    }

    const data = (await res.json()) as T;
    return { ok: true, data, usage };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { ok: false, error: message, status: 500 };
  }
}

/** Odds completas de um evento (fixture). */
export async function getOddsByFixture(
  params: GetOddsByFixtureParams,
): Promise<TheOddsApiResult<OddsFixtureEvent>> {
  const {
    sportKey,
    eventId,
    regions = THE_ODDS_API_DEFAULTS.regions,
    markets = THE_ODDS_API_DEFAULTS.markets,
    oddsFormat = THE_ODDS_API_DEFAULTS.oddsFormat,
  } = params;

  const result = await oddsApiFetch<RawEvent>(
    `/sports/${encodeURIComponent(sportKey)}/events/${encodeURIComponent(eventId)}/odds`,
    { regions, markets, oddsFormat },
  );

  if (!result.ok) return result;

  const mapped = mapFixtureEvent(result.data);
  if (!mapped) {
    return { ok: false, error: "Resposta da API sem dados de evento válidos", status: 502 };
  }

  return { ok: true, data: mapped, usage: result.usage };
}

/** Mercados disponíveis por casa para um evento. */
export async function getMarkets(
  params: GetMarketsParams,
): Promise<TheOddsApiResult<OddsMarketsSnapshot>> {
  const { sportKey, eventId, regions = THE_ODDS_API_DEFAULTS.regions } = params;

  const result = await oddsApiFetch<RawMarketsEvent>(
    `/sports/${encodeURIComponent(sportKey)}/events/${encodeURIComponent(eventId)}/markets`,
    { regions },
  );

  if (!result.ok) return result;

  const raw = result.data;
  const bookmakers: OddsBookmakerMarkets[] = (raw.bookmakers ?? [])
    .filter((b) => b.key && b.title)
    .map((b) => ({
      key: b.key!,
      title: b.title!,
      markets: (b.markets ?? [])
        .filter((m) => m.key)
        .map(
          (m): OddsMarketAvailability => ({
            key: m.key!,
            lastUpdate: m.last_update ?? null,
          }),
        ),
    }));

  return {
    ok: true,
    data: {
      eventId: raw.id ?? eventId,
      sportKey: raw.sport_key ?? sportKey,
      bookmakers,
    },
    usage: result.usage,
  };
}

/** Lista casas de apostas (de um evento ou agregadas do desporto). */
export async function getBookmakers(
  params: GetBookmakersParams,
): Promise<TheOddsApiResult<OddsBookmaker[]>> {
  const {
    sportKey,
    eventId,
    regions = THE_ODDS_API_DEFAULTS.regions,
    markets = "h2h",
  } = params;

  if (eventId) {
    const odds = await getOddsByFixture({
      sportKey,
      eventId,
      regions,
      markets,
    });
    if (!odds.ok) return odds;
    return {
      ok: true,
      data: odds.data.bookmakers.map(({ key, title, lastUpdate }) => ({
        key,
        title,
        lastUpdate,
        markets: [],
      })),
      usage: odds.usage,
    };
  }

  const list = await oddsApiFetch<RawEvent[]>(
    `/sports/${encodeURIComponent(sportKey)}/odds`,
    { regions, markets, oddsFormat: THE_ODDS_API_DEFAULTS.oddsFormat },
  );

  if (!list.ok) return list;

  const byKey = new Map<string, OddsBookmaker>();
  for (const event of list.data) {
    for (const bm of event.bookmakers ?? []) {
      const mapped = mapBookmaker(bm);
      if (mapped && !byKey.has(mapped.key)) {
        byKey.set(mapped.key, { ...mapped, markets: [] });
      }
    }
  }

  return {
    ok: true,
    data: Array.from(byKey.values()).sort((a, b) => a.title.localeCompare(b.title)),
    usage: list.usage,
  };
}

/** Lista eventos com odds de um desporto. */
export async function fetchSportOddsEvents(
  sportKey: string,
  markets = THE_ODDS_API_DEFAULTS.boardMarkets,
  regions = THE_ODDS_API_DEFAULTS.regions,
): Promise<TheOddsApiResult<OddsFixtureEvent[]>> {
  const list = await oddsApiFetch<RawEvent[]>(
    `/sports/${encodeURIComponent(sportKey)}/odds`,
    {
      regions,
      markets,
      oddsFormat: THE_ODDS_API_DEFAULTS.oddsFormat,
    },
  );

  if (!list.ok) return list;

  const events = list.data
    .map(mapFixtureEvent)
    .filter((e): e is OddsFixtureEvent => e != null);

  return { ok: true, data: events, usage: list.usage };
}

/** Primeiro evento com odds de um desporto (útil para testes). */
export async function fetchFirstSportEvent(
  sportKey: string,
  regions = THE_ODDS_API_DEFAULTS.regions,
): Promise<TheOddsApiResult<OddsFixtureEvent>> {
  const list = await oddsApiFetch<RawEvent[]>(
    `/sports/${encodeURIComponent(sportKey)}/odds`,
    {
      regions,
      markets: THE_ODDS_API_DEFAULTS.markets,
      oddsFormat: THE_ODDS_API_DEFAULTS.oddsFormat,
    },
  );

  if (!list.ok) return list;

  const first = list.data.map(mapFixtureEvent).find((e): e is OddsFixtureEvent => e != null);
  if (!first) {
    return { ok: false, error: "Nenhum evento com odds para este desporto", status: 404 };
  }

  return { ok: true, data: first, usage: list.usage };
}

/** Extrai moneyline (h2h), over/under (totals) e spreads de um evento. */
export function extractMainOddsLines(event: OddsFixtureEvent): OddsMainLines {
  const moneyline: OddsMoneylineQuote[] = [];
  const overUnder: OddsOverUnderQuote[] = [];
  const spreads: OddsMainLines["spreads"] = [];

  for (const bm of event.bookmakers) {
    for (const market of bm.markets) {
      if (market.key === "h2h" && market.outcomes.length > 0) {
        moneyline.push({
          bookmakerKey: bm.key,
          bookmakerTitle: bm.title,
          outcomes: market.outcomes,
        });
      }
      if (market.key === "totals" && market.outcomes.length > 0) {
        const over = market.outcomes.find((o) => /^over/i.test(o.name)) ?? null;
        const under = market.outcomes.find((o) => /^under/i.test(o.name)) ?? null;
        const point = over?.point ?? under?.point ?? null;
        overUnder.push({
          bookmakerKey: bm.key,
          bookmakerTitle: bm.title,
          point,
          over,
          under,
        });
      }
      if (market.key === "spreads" && market.outcomes.length > 0) {
        spreads.push({
          bookmakerKey: bm.key,
          bookmakerTitle: bm.title,
          outcomes: market.outcomes,
        });
      }
    }
  }

  return { moneyline, overUnder, spreads };
}
