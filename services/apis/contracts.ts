import type {
  FixtureDTO,
  GetOddsInput,
  GetStandingsInput,
  GetTeamStatsInput,
  ListFixturesInput,
  ListLiveEventsInput,
  LiveEventDTO,
  OddsSnapshotDTO,
  SportsProviderCapabilities,
  SportsProviderId,
  StandingsDTO,
  TeamStatsDTO,
} from "@/services/apis/types";

/**
 * Contrato comum a todos os fornecedores (mock ou API paga no futuro).
 */
export interface SportsDataProvider {
  readonly id: SportsProviderId;
  readonly capabilities: SportsProviderCapabilities;

  listFixtures(input: ListFixturesInput): Promise<FixtureDTO[]>;
  getOdds(input: GetOddsInput): Promise<OddsSnapshotDTO | null>;
  getStandings(input: GetStandingsInput): Promise<StandingsDTO | null>;
  getTeamStats(input: GetTeamStatsInput): Promise<TeamStatsDTO | null>;
  listLiveEvents(input: ListLiveEventsInput): Promise<LiveEventDTO[]>;
}
