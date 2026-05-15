import { formatKickoffPt, todayDateBrazil } from "@/lib/api-football/dates";
import type {
  ApiFootballRawFixture,
  FootballFixtureSummary,
  FootballFixturesResult,
} from "@/lib/api-football/types";

const API_BASE = "https://v3.football.api-sports.io";

export { todayDateBrazil };

export function getApiFootballKey(): string | null {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  return key || null;
}

function mapFixture(raw: ApiFootballRawFixture): FootballFixtureSummary | null {
  const id = raw.fixture?.id;
  if (id == null || !Number.isFinite(id)) return null;

  const dateIso = raw.fixture?.date ?? "";
  const venueName = raw.fixture?.venue?.name?.trim() || null;
  const venueCity = raw.fixture?.venue?.city?.trim() || null;
  const venueParts = [venueName, venueCity].filter(Boolean);

  return {
    fixtureId: id,
    dateIso,
    kickoffLabel: dateIso ? formatKickoffPt(dateIso) : "—",
    statusShort: raw.fixture?.status?.short ?? "—",
    statusLong: raw.fixture?.status?.long ?? raw.fixture?.status?.short ?? "—",
    leagueName: raw.league?.name ?? "—",
    country: raw.league?.country ?? "—",
    round: raw.league?.round?.trim() || null,
    homeTeamId: raw.teams?.home?.id ?? null,
    awayTeamId: raw.teams?.away?.id ?? null,
    homeTeam: raw.teams?.home?.name ?? "—",
    awayTeam: raw.teams?.away?.name ?? "—",
    homeLogo: raw.teams?.home?.logo ?? null,
    awayLogo: raw.teams?.away?.logo ?? null,
    goalsHome: raw.goals?.home ?? null,
    goalsAway: raw.goals?.away ?? null,
    venueName,
    venueCity,
    venue: venueParts.length > 0 ? venueParts.join(" · ") : null,
    referee: raw.fixture?.referee?.trim() || null,
  };
}

async function apiFootballFetch<T>(path: string): Promise<{
  ok: boolean;
  status: number;
  body: T;
}> {
  const apiKey = getApiFootballKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      body: { errors: { key: "API_FOOTBALL_KEY ausente" } } as T,
    };
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  const body = (await res.json()) as T;
  return { ok: res.ok, status: res.status, body };
}

export async function fetchFixturesByDate(date: string): Promise<FootballFixturesResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "Data inválida. Use YYYY-MM-DD." };
  }

  const { ok, status, body } = await apiFootballFetch<{
    errors?: Record<string, string>;
    results?: number;
    response?: ApiFootballRawFixture[];
  }>(`/fixtures?date=${encodeURIComponent(date)}`);

  if (!getApiFootballKey()) {
    return { ok: false, error: "API_FOOTBALL_KEY ausente" };
  }

  if (!ok) {
    return {
      ok: false,
      error: `API-Football HTTP ${status}`,
      apiErrors: body.errors,
    };
  }

  if (body.errors && Object.keys(body.errors).length > 0) {
    return { ok: false, error: "API-Football devolveu erros", apiErrors: body.errors };
  }

  const fixtures = (body.response ?? [])
    .map(mapFixture)
    .filter((f): f is FootballFixtureSummary => f != null)
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));

  return {
    ok: true,
    date,
    results: typeof body.results === "number" ? body.results : fixtures.length,
    fixtures,
  };
}

export async function fetchFixtureById(
  fixtureId: number,
): Promise<{ ok: true; fixture: FootballFixtureSummary; raw: ApiFootballRawFixture } | { ok: false; error: string }> {
  const { ok, status, body } = await apiFootballFetch<{
    errors?: Record<string, string>;
    response?: ApiFootballRawFixture[];
  }>(`/fixtures?id=${fixtureId}`);

  if (!getApiFootballKey()) {
    return { ok: false, error: "API_FOOTBALL_KEY ausente" };
  }

  if (!ok) {
    return { ok: false, error: `API-Football HTTP ${status}` };
  }

  if (body.errors && Object.keys(body.errors).length > 0) {
    return { ok: false, error: "API-Football devolveu erros" };
  }

  const mapped = mapFixture(body.response?.[0] ?? {});
  if (!mapped) {
    return { ok: false, error: "Fixture não encontrado" };
  }

  return { ok: true, fixture: mapped, raw: body.response?.[0] ?? {} };
}
