import {
  computeMatchTrends,
  computeTeamForm,
  mapH2HFixtures,
} from "@/lib/api-football/form-trends";
import { mapFixtureStatistics } from "@/lib/api-football/statistics";
import type {
  ApiFootballRawFixture,
  FootballFixtureDetailResult,
  FootballFixtureEditorialDetail,
} from "@/lib/api-football/types";
import { fetchFixtureById, getApiFootballKey } from "@/lib/api-football/client";

const API_BASE = "https://v3.football.api-sports.io";

async function apiFetch<T>(path: string): Promise<T | null> {
  const apiKey = getApiFootballKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { errors?: Record<string, string>; response?: T };
    if (body.errors && Object.keys(body.errors).length > 0) return null;
    return body.response ?? null;
  } catch {
    return null;
  }
}

async function fetchTeamLastFixtures(teamId: number, last = 5): Promise<ApiFootballRawFixture[]> {
  const data = await apiFetch<ApiFootballRawFixture[]>(
    `/fixtures?team=${teamId}&last=${last}`,
  );
  return data ?? [];
}

async function fetchH2H(
  homeId: number,
  awayId: number,
  last = 10,
): Promise<ApiFootballRawFixture[]> {
  const data = await apiFetch<ApiFootballRawFixture[]>(
    `/fixtures/headtohead?h2h=${homeId}-${awayId}&last=${last}`,
  );
  return data ?? [];
}

type RawStatisticsResponse = {
  team?: { id?: number };
  statistics?: { type?: string; value?: string | number | null }[];
}[];

async function fetchFixtureStatistics(fixtureId: number) {
  return apiFetch<RawStatisticsResponse>(`/fixtures/statistics?fixture=${fixtureId}`);
}

export async function loadFixtureEditorialDetail(
  fixtureId: number,
): Promise<FootballFixtureDetailResult> {
  if (!getApiFootballKey()) {
    return { ok: false, error: "API_FOOTBALL_KEY ausente" };
  }

  const base = await fetchFixtureById(fixtureId);
  if (!base.ok) {
    return { ok: false, error: base.error };
  }

  const { fixture, raw } = base;
  const homeId = raw.teams?.home?.id ?? fixture.homeTeamId;
  const awayId = raw.teams?.away?.id ?? fixture.awayTeamId;

  const [statsRaw, homeLast, awayLast, h2hRaw] = await Promise.all([
    fetchFixtureStatistics(fixtureId),
    homeId ? fetchTeamLastFixtures(homeId, 5) : Promise.resolve([]),
    awayId ? fetchTeamLastFixtures(awayId, 5) : Promise.resolve([]),
    homeId && awayId ? fetchH2H(homeId, awayId, 10) : Promise.resolve([]),
  ]);

  const statistics = mapFixtureStatistics(statsRaw ?? undefined, homeId, awayId);

  const form = {
    home: homeId ? computeTeamForm(homeLast, homeId) : emptyForm(),
    away: awayId ? computeTeamForm(awayLast, awayId) : emptyForm(),
  };

  const trendPool = dedupeFixtures([...homeLast, ...awayLast]);
  const trends = computeMatchTrends(trendPool);
  const h2h = mapH2HFixtures(h2hRaw);

  const detail: FootballFixtureEditorialDetail = {
    fixture,
    statistics,
    form,
    trends,
    h2h,
  };

  return { ok: true, detail };
}

function emptyForm() {
  return {
    sampleSize: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    avgGoalsScored: 0,
    avgGoalsConceded: 0,
  };
}

function dedupeFixtures(fixtures: ApiFootballRawFixture[]): ApiFootballRawFixture[] {
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
