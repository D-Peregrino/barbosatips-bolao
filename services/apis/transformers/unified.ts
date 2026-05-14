import type { FixtureDTO, LiveEventDTO, OddsSnapshotDTO, StandingsDTO, TeamStatsDTO } from "@/services/apis/types";

/** Garante números finitos em placares vindos de APIs externas. */
export function clampScore(n: unknown): number {
  const x = typeof n === "number" ? n : parseInt(String(n), 10);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(99, x));
}

export function ensureFixture(d: Partial<FixtureDTO> & Pick<FixtureDTO, "id" | "sport">): FixtureDTO {
  return {
    id: d.id,
    sport: d.sport,
    competicao: d.competicao ?? "—",
    competicaoId: d.competicaoId,
    temporada: d.temporada,
    casa: d.casa ?? { id: "home", nome: "Casa" },
    fora: d.fora ?? { id: "away", nome: "Fora" },
    inicioISO: d.inicioISO ?? new Date().toISOString(),
    status: d.status ?? "agendado",
    placar: d.placar ?? null,
    meta: d.meta,
  };
}

export function ensureOdds(o: Partial<OddsSnapshotDTO> & Pick<OddsSnapshotDTO, "fixtureId" | "sport">): OddsSnapshotDTO {
  return {
    fixtureId: o.fixtureId,
    sport: o.sport,
    atualizadoISO: o.atualizadoISO ?? new Date().toISOString(),
    fontes: o.fontes?.length ? o.fontes : ["mock"],
    mercados: o.mercados ?? [],
  };
}

export function ensureStandings(s: Partial<StandingsDTO> & Pick<StandingsDTO, "sport">): StandingsDTO {
  return {
    competicao: s.competicao ?? "—",
    competicaoId: s.competicaoId,
    temporada: s.temporada ?? "2025/26",
    sport: s.sport,
    linhas: s.linhas ?? [],
  };
}

export function ensureTeamStats(t: Partial<TeamStatsDTO> & Pick<TeamStatsDTO, "teamId" | "nome" | "sport">): TeamStatsDTO {
  return {
    teamId: t.teamId,
    nome: t.nome,
    sport: t.sport,
    metricas: t.metricas ?? {},
    atualizadoISO: t.atualizadoISO ?? new Date().toISOString(),
  };
}

export function ensureLiveEvent(e: Partial<LiveEventDTO> & Pick<LiveEventDTO, "id" | "fixtureId" | "sport" | "tipo" | "descricao">): LiveEventDTO {
  return {
    id: e.id,
    fixtureId: e.fixtureId,
    sport: e.sport,
    minuto: e.minuto,
    periodo: e.periodo,
    tipo: e.tipo,
    descricao: e.descricao,
    criadoISO: e.criadoISO ?? new Date().toISOString(),
  };
}
