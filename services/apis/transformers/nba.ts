import type { FixtureDTO, LiveEventDTO, OddsSnapshotDTO, StandingsDTO, TeamStatsDTO } from "@/services/apis/types";
import { ensureFixture, ensureLiveEvent, ensureOdds, ensureStandings, ensureTeamStats } from "@/services/apis/transformers/unified";

/** Futuro: NBA.com / balldontlie / Odds API → DTO interno. */
export function transformNbaFixture(raw: unknown): FixtureDTO {
  if (raw && typeof raw === "object" && "id" in raw) return ensureFixture(raw as FixtureDTO);
  return ensureFixture({
    id: "nba-unknown",
    sport: "nba",
    competicao: "NBA — mock",
    casa: { id: "h", nome: "Home" },
    fora: { id: "a", nome: "Away" },
    inicioISO: new Date().toISOString(),
    status: "agendado",
  });
}

export function transformNbaOdds(raw: unknown, fixtureId: string): OddsSnapshotDTO {
  if (raw && typeof raw === "object") return ensureOdds({ ...(raw as OddsSnapshotDTO), fixtureId, sport: "nba" });
  return ensureOdds({ fixtureId, sport: "nba", mercados: [] });
}

export function transformNbaStandings(raw: unknown): StandingsDTO {
  if (raw && typeof raw === "object") return ensureStandings({ ...(raw as StandingsDTO), sport: "nba" });
  return ensureStandings({ sport: "nba", competicao: "NBA", temporada: "2025-26", linhas: [] });
}

export function transformNbaTeamStats(raw: unknown, teamId: string, nome: string): TeamStatsDTO {
  if (raw && typeof raw === "object") return ensureTeamStats({ ...(raw as TeamStatsDTO), teamId, nome, sport: "nba" });
  return ensureTeamStats({ teamId, nome, sport: "nba", metricas: {} });
}

export function transformNbaLiveEvents(raw: unknown): LiveEventDTO[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e, i) => ensureLiveEvent({ ...(e as LiveEventDTO), id: String((e as LiveEventDTO).id ?? i) }));
}
