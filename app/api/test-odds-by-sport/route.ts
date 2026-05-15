import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = "https://api.the-odds-api.com/v4";

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

function parseHeaderInt(res: Response, name: string): number | null {
  const h = res.headers.get(name);
  if (h == null || h === "") return null;
  const n = Number(h);
  return Number.isFinite(n) ? n : null;
}

type RawBookmaker = {
  key?: string;
  title?: string;
  markets?: { key?: string }[];
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

type SportDiag = {
  sportKey: string;
  /** Código HTTP da resposta The Odds API. */
  status: number;
  eventsCount: number;
  firstEvent: {
    id: string | null;
    homeTeam: string | null;
    awayTeam: string | null;
    commenceTime: string | null;
    sportTitle: string | null;
  } | null;
  bookmakersCount: number;
  marketsFound: string[];
  error: string | null;
  remainingRequests: number | null;
  usedRequests: number | null;
};

function summarizeFirstEvent(ev: RawEvent | undefined): {
  firstEvent: SportDiag["firstEvent"];
  bookmakersCount: number;
  marketsFound: string[];
} {
  if (!ev) {
    return { firstEvent: null, bookmakersCount: 0, marketsFound: [] };
  }
  const bookmakers = ev.bookmakers ?? [];
  const keys = new Set<string>();
  for (const bm of bookmakers) {
    for (const m of bm.markets ?? []) {
      if (typeof m.key === "string" && m.key) keys.add(m.key);
    }
  }
  return {
    firstEvent: {
      id: typeof ev.id === "string" ? ev.id : null,
      homeTeam: typeof ev.home_team === "string" ? ev.home_team : null,
      awayTeam: typeof ev.away_team === "string" ? ev.away_team : null,
      commenceTime: typeof ev.commence_time === "string" ? ev.commence_time : null,
      sportTitle: typeof ev.sport_title === "string" ? ev.sport_title : null,
    },
    bookmakersCount: bookmakers.length,
    marketsFound: Array.from(keys).sort(),
  };
}

async function diagnoseSport(apiKey: string, sportKey: string): Promise<SportDiag> {
  const url = new URL(
    `${API_BASE}/sports/${encodeURIComponent(sportKey)}/odds`,
  );
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "eu");
  url.searchParams.set("markets", "h2h,totals,btts");
  url.searchParams.set("oddsFormat", "decimal");
  url.searchParams.set("dateFormat", "iso");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    return {
      sportKey,
      status: 0,
      eventsCount: 0,
      firstEvent: null,
      bookmakersCount: 0,
      marketsFound: [],
      error: msg,
      remainingRequests: null,
      usedRequests: null,
    };
  }

  const remainingRequests = parseHeaderInt(res, "x-requests-remaining");
  const usedRequests = parseHeaderInt(res, "x-requests-used");

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    return {
      sportKey,
      status: res.status,
      eventsCount: 0,
      firstEvent: null,
      bookmakersCount: 0,
      marketsFound: [],
      error:
        typeof parsed === "object" && parsed && "message" in parsed
          ? String((parsed as { message?: string }).message)
          : text.slice(0, 400) || res.statusText,
      remainingRequests,
      usedRequests,
    };
  }

  const rows = Array.isArray(parsed) ? (parsed as RawEvent[]) : [];
  const first = rows[0];
  const { firstEvent, bookmakersCount, marketsFound } =
    summarizeFirstEvent(first);

  return {
    sportKey,
    status: res.status,
    eventsCount: rows.length,
    firstEvent,
    bookmakersCount,
    marketsFound,
    error: null,
    remainingRequests,
    usedRequests,
  };
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY?.trim() ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ODDS_API_KEY ausente" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const sportKeys = sportKeysFromEnv();
  const results: SportDiag[] = [];

  for (const sportKey of sportKeys) {
    results.push(await diagnoseSport(apiKey, sportKey));
  }

  const totalEvents = results.reduce((a, r) => a + r.eventsCount, 0);

  return NextResponse.json(
    {
      ok: true,
      sportKeys,
      totalEvents,
      results,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
