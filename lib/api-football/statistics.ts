import type { MatchStatistics, TeamMatchStats } from "@/lib/api-football/types";

type RawStatEntry = { type?: string; value?: string | number | null };

type RawTeamStatistics = {
  team?: { id?: number };
  statistics?: RawStatEntry[];
};

const STAT_MAP: Record<keyof TeamMatchStats, string[]> = {
  possession: ["Ball Possession"],
  shots: ["Total Shots"],
  shotsOnTarget: ["Shots on Goal"],
  corners: ["Corner Kicks"],
  fouls: ["Fouls"],
  yellowCards: ["Yellow Cards"],
  redCards: ["Red Cards"],
};

function formatStatValue(value: string | number | null | undefined): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function pickStat(stats: RawStatEntry[] | undefined, labels: string[]): string | null {
  if (!stats?.length) return null;
  for (const label of labels) {
    const found = stats.find((s) => s.type === label);
    if (found?.value != null) return formatStatValue(found.value);
  }
  return null;
}

function mapTeamStats(stats: RawStatEntry[] | undefined): TeamMatchStats {
  return {
    possession: pickStat(stats, STAT_MAP.possession),
    shots: pickStat(stats, STAT_MAP.shots),
    shotsOnTarget: pickStat(stats, STAT_MAP.shotsOnTarget),
    corners: pickStat(stats, STAT_MAP.corners),
    fouls: pickStat(stats, STAT_MAP.fouls),
    yellowCards: pickStat(stats, STAT_MAP.yellowCards),
    redCards: pickStat(stats, STAT_MAP.redCards),
  };
}

export function mapFixtureStatistics(
  response: RawTeamStatistics[] | undefined,
  homeTeamId: number | null,
  awayTeamId: number | null,
): MatchStatistics | null {
  if (!response?.length) return null;

  const homeRaw = response.find((r) => r.team?.id === homeTeamId) ?? response[0];
  const awayRaw =
    response.find((r) => r.team?.id === awayTeamId) ??
    response.find((r) => r.team?.id !== homeRaw?.team?.id) ??
    response[1];

  if (!homeRaw && !awayRaw) return null;

  const home = mapTeamStats(homeRaw?.statistics);
  const away = mapTeamStats(awayRaw?.statistics);

  const hasAny = [...Object.values(home), ...Object.values(away)].some((v) => v != null);
  if (!hasAny) return null;

  return { home, away };
}
