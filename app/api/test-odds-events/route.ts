import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = "https://api.the-odds-api.com/v4";
const MARKETS = "h2h";
const REGIONS = "eu";
const ODDS_FORMAT = "decimal";
const SPORT_KEYS = ["soccer_brazil_campeonato"];

type RawBookmaker = {
  key?: string;
  title?: string;
  markets?: { key?: string; outcomes?: unknown[] }[];
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

type SportResult = {
  sportKey: string;
  status: number;
  totalEvents: number;
  firstEvent: EventSummary | null;
};

type EventSummary = {
  id: string | null;
  sportKey: string | null;
  sportTitle: string | null;
  commenceTime: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  bookmakersCount: number;
  marketKeys: string[];
};

function parseSportKeys(raw: string | undefined): string[] {
  return (raw ?? "")
    .trim()
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function summarizeEvent(event: RawEvent | undefined): EventSummary | null {
  if (!event) return null;
  const marketKeys = new Set<string>();
  for (const bookmaker of event.bookmakers ?? []) {
    for (const market of bookmaker.markets ?? []) {
      if (market.key) marketKeys.add(market.key);
    }
  }

  return {
    id: event.id ?? null,
    sportKey: event.sport_key ?? null,
    sportTitle: event.sport_title ?? null,
    commenceTime: event.commence_time ?? null,
    homeTeam: event.home_team ?? null,
    awayTeam: event.away_team ?? null,
    bookmakersCount: event.bookmakers?.length ?? 0,
    marketKeys: Array.from(marketKeys).sort(),
  };
}

function parseErrorBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    return String((body as { message?: unknown }).message ?? fallback);
  }
  return fallback;
}

async function fetchEventsForSport(
  apiKey: string,
  sportKey: string,
): Promise<{ result: SportResult; error: string | null }> {
  const url = new URL(`${API_BASE}/sports/${encodeURIComponent(sportKey)}/odds`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("markets", MARKETS);
  url.searchParams.set("regions", REGIONS);
  url.searchParams.set("oddsFormat", ODDS_FORMAT);

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const body = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      return {
        result: {
          sportKey,
          status: response.status,
          totalEvents: 0,
          firstEvent: null,
        },
        error: parseErrorBody(body, response.statusText || `HTTP ${response.status}`),
      };
    }

    const events = Array.isArray(body) ? (body as RawEvent[]) : [];
    return {
      result: {
        sportKey,
        status: response.status,
        totalEvents: events.length,
        firstEvent: summarizeEvent(events[0]),
      },
      error: null,
    };
  } catch (error) {
    return {
      result: {
        sportKey,
        status: 0,
        totalEvents: 0,
        firstEvent: null,
      },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY?.trim();
  const sportKeys = parseSportKeys(process.env.MARKET_BOARD_SPORT_KEYS).filter((key) =>
    SPORT_KEYS.includes(key),
  );
  const effectiveSportKeys = sportKeys.length > 0 ? sportKeys : SPORT_KEYS;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: 503,
        totalEvents: 0,
        firstEvent: null,
        errors: { _env: "ODDS_API_KEY ausente" },
        sportKeys: effectiveSportKeys,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const calls = await Promise.all(
    effectiveSportKeys.map((sportKey) => fetchEventsForSport(apiKey, sportKey)),
  );
  const results = calls.map((call) => call.result);
  const errors = Object.fromEntries(
    calls
      .filter((call) => call.error)
      .map((call) => [call.result.sportKey, call.error]),
  );
  const totalEvents = results.reduce((sum, result) => sum + result.totalEvents, 0);
  const firstEvent = results.find((result) => result.firstEvent)?.firstEvent ?? null;

  return NextResponse.json(
    {
      status: Object.keys(errors).length > 0 ? "partial" : "ok",
      totalEvents,
      firstEvent,
      errors,
      sportKeys: effectiveSportKeys,
      request: {
        markets: MARKETS,
        regions: REGIONS,
        oddsFormat: ODDS_FORMAT,
      },
      results,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
