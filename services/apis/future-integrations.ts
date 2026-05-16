import type { SportsProviderId } from "@/services/apis/types";

/**
 * Nomes sugeridos de variáveis de ambiente para chaves/APIs futuras.
 * Não ler `process.env` aqui — apenas documentação tipada para implementação posterior.
 */
export const FUTURE_SPORTS_ENV_KEYS: Record<Exclude<SportsProviderId, "mock">, readonly string[]> = {
  api_football: ["API_FOOTBALL_KEY", "API_FOOTBALL_HOST"],
  the_odds_api: ["ODDS_API_KEY"],
  sportradar: ["SPORTRADAR_API_KEY", "SPORTRADAR_PRODUCT"],
  betfair: ["BETFAIR_APP_KEY", "BETFAIR_SESSION_TOKEN"],
  sofascore_unofficial: ["SOFASCORE_UNOFFICIAL_BASE_URL", "SOFASCORE_UNOFFICIAL_COOKIE"],
} as const;

export type FutureSportsProvider = Exclude<SportsProviderId, "mock">;

const NOTES: Record<FutureSportsProvider, string> = {
  api_football: "Jogos, equipas, ligas, estatísticas agregadas; mapear para FixtureDTO / TeamStatsDTO.",
  the_odds_api: "Odds pré-jogo e mercados; mapear para OddsSnapshotDTO.",
  sportradar: "Feeds oficiais (odds, live, standings) conforme produto contratado.",
  betfair: "Exchange / precos; respeitar ToS e limites; normalizar seleções.",
  sofascore_unofficial: "Não oficial — risco de bloqueio; usar só com consentimento e fallback mock.",
};

export function describeFutureSportsProvider(id: FutureSportsProvider): string {
  return NOTES[id];
}
