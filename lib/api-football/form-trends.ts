import { formatKickoffPt } from "@/lib/api-football/dates";
import type {
  ApiFootballRawFixture,
  H2HMatch,
  MatchTrends,
  TeamRecentForm,
} from "@/lib/api-football/types";

const FINISHED = new Set(["FT", "AET", "PEN"]);

function isFinished(f: ApiFootballRawFixture): boolean {
  const s = f.fixture?.status?.short;
  return s != null && FINISHED.has(s);
}

function goalsForTeam(f: ApiFootballRawFixture, teamId: number): number | null {
  const isHome = f.teams?.home?.id === teamId;
  const isAway = f.teams?.away?.id === teamId;
  if (isHome) return f.goals?.home ?? null;
  if (isAway) return f.goals?.away ?? null;
  return null;
}

function goalsAgainstTeam(f: ApiFootballRawFixture, teamId: number): number | null {
  const isHome = f.teams?.home?.id === teamId;
  const isAway = f.teams?.away?.id === teamId;
  if (isHome) return f.goals?.away ?? null;
  if (isAway) return f.goals?.home ?? null;
  return null;
}

export function computeTeamForm(
  fixtures: ApiFootballRawFixture[],
  teamId: number,
): TeamRecentForm {
  const played = fixtures.filter(isFinished).slice(0, 5);
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let scored = 0;
  let conceded = 0;

  for (const f of played) {
    const gf = goalsForTeam(f, teamId);
    const ga = goalsAgainstTeam(f, teamId);
    if (gf == null || ga == null) continue;
    scored += gf;
    conceded += ga;
    if (gf > ga) wins += 1;
    else if (gf === ga) draws += 1;
    else losses += 1;
  }

  return {
    sampleSize: played.length,
    wins,
    draws,
    losses,
    avgGoalsScored: played.length ? scored / played.length : 0,
    avgGoalsConceded: played.length ? conceded / played.length : 0,
  };
}

export function computeMatchTrends(fixtures: ApiFootballRawFixture[]): MatchTrends {
  const played = fixtures.filter(isFinished);
  let btts = 0;
  let over25 = 0;
  let under25 = 0;
  let totalGoals = 0;

  for (const f of played) {
    const h = f.goals?.home;
    const a = f.goals?.away;
    if (h == null || a == null) continue;
    const total = h + a;
    totalGoals += total;
    if (h > 0 && a > 0) btts += 1;
    if (total > 2) over25 += 1;
    if (total < 3) under25 += 1;
  }

  const n = played.length;
  const pct = (x: number) => (n ? Math.round((x / n) * 100) : 0);

  return {
    sampleSize: n,
    bttsPct: pct(btts),
    over25Pct: pct(over25),
    under25Pct: pct(under25),
    avgTotalGoals: n ? Math.round((totalGoals / n) * 100) / 100 : 0,
  };
}

export function mapH2HFixtures(fixtures: ApiFootballRawFixture[]): H2HMatch[] {
  return fixtures
    .filter((f) => f.fixture?.id != null)
    .map((f) => {
      const dateIso = f.fixture?.date ?? "";
      return {
        fixtureId: f.fixture!.id!,
        dateIso,
        kickoffLabel: dateIso ? formatKickoffPt(dateIso) : "—",
        leagueName: f.league?.name ?? "—",
        homeTeam: f.teams?.home?.name ?? "—",
        awayTeam: f.teams?.away?.name ?? "—",
        goalsHome: f.goals?.home ?? null,
        goalsAway: f.goals?.away ?? null,
      };
    });
}
