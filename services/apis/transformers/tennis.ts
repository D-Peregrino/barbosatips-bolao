import type { FixtureDTO, LiveEventDTO, OddsSnapshotDTO, StandingsDTO, TeamStatsDTO } from "@/services/apis/types";
import { ensureFixture, ensureLiveEvent, ensureOdds, ensureStandings, ensureTeamStats } from "@/services/apis/transformers/unified";

/** Futuro: ATP/WTA / JSON genérico → DTO interno. */
export function transformTennisFixture(raw: unknown): FixtureDTO {
  if (raw && typeof raw === "object" && "id" in raw) return ensureFixture(raw as FixtureDTO);
  return ensureFixture({
    id: "tn-unknown",
    sport: "tenis",
    competicao: "ATP — mock",
    casa: { id: "p1", nome: "Jogador A" },
    fora: { id: "p2", nome: "Jogador B" },
    inicioISO: new Date().toISOString(),
    status: "agendado",
    meta: { superficie: "dura" },
  });
}

export function transformTennisOdds(raw: unknown, fixtureId: string): OddsSnapshotDTO {
  if (raw && typeof raw === "object") return ensureOdds({ ...(raw as OddsSnapshotDTO), fixtureId, sport: "tenis" });
  return ensureOdds({ fixtureId, sport: "tenis", mercados: [] });
}

export function transformTennisStandings(raw: unknown): StandingsDTO {
  if (raw && typeof raw === "object") return ensureStandings({ ...(raw as StandingsDTO), sport: "tenis" });
  return ensureStandings({ sport: "tenis", competicao: "Ranking mock", temporada: "2025", linhas: [] });
}

export function transformTennisTeamStats(raw: unknown, teamId: string, nome: string): TeamStatsDTO {
  if (raw && typeof raw === "object") return ensureTeamStats({ ...(raw as TeamStatsDTO), teamId, nome, sport: "tenis" });
  return ensureTeamStats({ teamId, nome, sport: "tenis", metricas: {} });
}

export function transformTennisLiveEvents(raw: unknown): LiveEventDTO[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e, i) => ensureLiveEvent({ ...(e as LiveEventDTO), id: String((e as LiveEventDTO).id ?? i) }));
}
