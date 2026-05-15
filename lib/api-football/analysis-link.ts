import type { FootballFixtureSummary } from "@/lib/api-football/types";

export function buildEditorialAnalysisHref(f: FootballFixtureSummary): string {
  const params = new URLSearchParams({
    fixtureId: String(f.fixtureId),
    home: f.homeTeam,
    away: f.awayTeam,
    league: f.leagueName,
    country: f.country,
  });
  return `/admin-editorial/nova?${params.toString()}`;
}
