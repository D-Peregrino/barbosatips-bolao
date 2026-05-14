import type { SportsDataProvider } from "@/services/apis/contracts";
import { sportsCacheGet, sportsCacheKey, sportsCacheSet } from "@/services/apis/cache/memory-cache";
import {
  ensureFixture,
  ensureLiveEvent,
  ensureOdds,
  ensureStandings,
  ensureTeamStats,
} from "@/services/apis/transformers/unified";
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
import {
  mockFixtures,
  mockLiveEvents,
  mockOddsSnapshot,
  mockStandings,
  mockTeamStats,
} from "@/services/apis/providers/mock-data";

const DEFAULT_LATENCY_MS = 90;
const TTL_FIXTURES_SEC = 45;
const TTL_ODDS_SEC = 20;
const TTL_STANDINGS_SEC = 120;
const TTL_STATS_SEC = 90;
const TTL_LIVE_SEC = 8;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const MOCK_CAPS: SportsProviderCapabilities = {
  fixtures: true,
  odds: true,
  standings: true,
  statistics: true,
  scores: true,
  live: true,
};

/**
 * Fornecedor mock com cache TTL e latência simulada.
 * Todos os `SportsProviderId` devolvem os mesmos dados mock até existirem adaptadores HTTP reais
 * (ver `future-integrations.ts`); o `id` diferencia apenas chaves de cache e telemetria futura.
 */
export class MockSportsDataProvider implements SportsDataProvider {
  readonly id: SportsProviderId;

  readonly capabilities: SportsProviderCapabilities = MOCK_CAPS;

  constructor(id: SportsProviderId = "mock") {
    this.id = id;
  }

  private async latency(): Promise<void> {
    const jitter = Math.floor(Math.random() * 80);
    await sleep(DEFAULT_LATENCY_MS + jitter);
  }

  async listFixtures(input: ListFixturesInput): Promise<FixtureDTO[]> {
    const limit = input.limit ?? 10;
    const key = sportsCacheKey([this.id, "fixtures", input.sport, limit]);
    const hit = sportsCacheGet<FixtureDTO[]>(key);
    if (hit) return hit;

    await this.latency();

    const data = mockFixtures(input.sport, limit).map((f) => ensureFixture(f));
    sportsCacheSet(key, data, TTL_FIXTURES_SEC);
    return data;
  }

  async getOdds(input: GetOddsInput): Promise<OddsSnapshotDTO | null> {
    const key = sportsCacheKey([this.id, "odds", input.sport, input.fixtureId]);
    const hit = sportsCacheGet<OddsSnapshotDTO | null>(key);
    if (hit !== undefined) return hit;

    await this.latency();

    const raw = mockOddsSnapshot(input.sport, input.fixtureId);
    const data = raw ? ensureOdds(raw) : null;
    sportsCacheSet(key, data, TTL_ODDS_SEC);
    return data;
  }

  async getStandings(input: GetStandingsInput): Promise<StandingsDTO | null> {
    const key = sportsCacheKey([this.id, "standings", input.sport, input.competicaoId ?? ""]);
    const hit = sportsCacheGet<StandingsDTO>(key);
    if (hit) return hit;

    await this.latency();

    const data = ensureStandings(mockStandings(input.sport, input.competicaoId));
    sportsCacheSet(key, data, TTL_STANDINGS_SEC);
    return data;
  }

  async getTeamStats(input: GetTeamStatsInput): Promise<TeamStatsDTO | null> {
    const key = sportsCacheKey([this.id, "teamStats", input.sport, input.teamId]);
    const hit = sportsCacheGet<TeamStatsDTO>(key);
    if (hit) return hit;

    await this.latency();

    const data = ensureTeamStats(mockTeamStats(input.sport, input.teamId, input.teamId));
    sportsCacheSet(key, data, TTL_STATS_SEC);
    return data;
  }

  async listLiveEvents(input: ListLiveEventsInput): Promise<LiveEventDTO[]> {
    const key = sportsCacheKey([this.id, "live", input.sport]);
    const hit = sportsCacheGet<LiveEventDTO[]>(key);
    if (hit) return hit;

    await this.latency();

    const data = mockLiveEvents(input.sport).map((e) => ensureLiveEvent(e));
    sportsCacheSet(key, data, TTL_LIVE_SEC);
    return data;
  }
}
