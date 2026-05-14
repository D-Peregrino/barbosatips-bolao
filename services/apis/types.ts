/**
 * Domínio unificado para dados desportivos (futebol, tênis, NBA).
 * Os transformers mapeiam respostas de cada fornecedor futuro para estes tipos.
 */

export type SportDomain = "futebol" | "tenis" | "nba";

/** Identificadores de fornecedor — apenas `mock` implementado. */
export type SportsProviderId =
  | "mock"
  | "api_football"
  | "the_odds_api"
  | "sportradar"
  | "betfair"
  | "sofascore_unofficial";

export type FixtureStatus = "agendado" | "live" | "terminado" | "adiado";

/** Jogo / confronto. */
export type FixtureDTO = {
  id: string;
  sport: SportDomain;
  competicao: string;
  competicaoId?: string;
  temporada?: string;
  casa: { id: string; nome: string; abbr?: string };
  fora: { id: string; nome: string; abbr?: string };
  inicioISO: string;
  status: FixtureStatus;
  placar?: { casa: number; fora: number } | null;
  /** Metadados livres (ex.: rodada, pista). */
  meta?: Record<string, string | number | boolean | null>;
};

export type OddsSelectionDTO = {
  id: string;
  nome: string;
  odd: number;
};

export type OddsMarketDTO = {
  id: string;
  mercado: string;
  selecoes: OddsSelectionDTO[];
};

/** Snapshot de odds por fonte (casa de apostas simulada no mock). */
export type OddsSnapshotDTO = {
  fixtureId: string;
  sport: SportDomain;
  atualizadoISO: string;
  fontes: string[];
  mercados: OddsMarketDTO[];
};

export type StandingRowDTO = {
  posicao: number;
  equipa: string;
  equipaId?: string;
  jogos: number;
  pontos: number;
  vitorias?: number;
  empates?: number;
  derrotas?: number;
};

export type StandingsDTO = {
  competicao: string;
  competicaoId?: string;
  temporada: string;
  sport: SportDomain;
  linhas: StandingRowDTO[];
};

export type TeamStatsDTO = {
  teamId: string;
  nome: string;
  sport: SportDomain;
  /** Métricas agnósticas (xG, ORtg, % primeiro serviço…). */
  metricas: Record<string, number>;
  atualizadoISO: string;
};

export type LiveEventType = "golo" | "cartao" | "substituicao" | "ponto" | "outro";

/** Evento ao vivo (flash). */
export type LiveEventDTO = {
  id: string;
  fixtureId: string;
  sport: SportDomain;
  minuto?: number;
  periodo?: string;
  tipo: LiveEventType;
  descricao: string;
  criadoISO: string;
};

export type SportsProviderCapabilities = {
  fixtures: boolean;
  odds: boolean;
  standings: boolean;
  statistics: boolean;
  scores: boolean;
  live: boolean;
};

export type ListFixturesInput = {
  sport: SportDomain;
  limit?: number;
};

export type GetOddsInput = {
  sport: SportDomain;
  fixtureId: string;
};

export type GetStandingsInput = {
  sport: SportDomain;
  competicaoId?: string;
};

export type GetTeamStatsInput = {
  sport: SportDomain;
  teamId: string;
};

export type ListLiveEventsInput = {
  sport: SportDomain;
};
