import type { FixtureDTO, LiveEventDTO, OddsSnapshotDTO, StandingsDTO, TeamStatsDTO } from "@/services/apis/types";
import { ensureFixture, ensureLiveEvent, ensureOdds, ensureStandings, ensureTeamStats } from "@/services/apis/transformers/unified";

/** Payload bruto futuro API-Football → DTO interno (hoje: mock já nativo). */
export function transformFootballFixture(raw: unknown): FixtureDTO {
  if (raw && typeof raw === "object" && "id" in raw && "sport" in raw) {
    return ensureFixture(raw as FixtureDTO);
  }
  return ensureFixture({
    id: "fb-unknown",
    sport: "futebol",
    competicao: "—",
    casa: { id: "c", nome: "Casa" },
    fora: { id: "f", nome: "Fora" },
    inicioISO: new Date().toISOString(),
    status: "agendado",
  });
}

export function transformFootballOdds(raw: unknown, fixtureId: string): OddsSnapshotDTO {
  if (raw && typeof raw === "object") return ensureOdds({ ...(raw as OddsSnapshotDTO), fixtureId, sport: "futebol" });
  return ensureOdds({ fixtureId, sport: "futebol", mercados: [] });
}

export function transformFootballStandings(raw: unknown): StandingsDTO {
  if (raw && typeof raw === "object") return ensureStandings({ ...(raw as StandingsDTO), sport: "futebol" });
  return ensureStandings({ sport: "futebol", competicao: "—", temporada: "2025/26", linhas: [] });
}

export function transformFootballTeamStats(raw: unknown, teamId: string, nome: string): TeamStatsDTO {
  if (raw && typeof raw === "object") return ensureTeamStats({ ...(raw as TeamStatsDTO), teamId, nome, sport: "futebol" });
  return ensureTeamStats({ teamId, nome, sport: "futebol", metricas: {} });
}

export function transformFootballLiveEvents(raw: unknown): LiveEventDTO[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e, i) => ensureLiveEvent({ ...(e as LiveEventDTO), id: String((e as LiveEventDTO).id ?? i) }));
}
