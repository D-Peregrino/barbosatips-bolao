const MARKET_LABELS: Record<string, string> = {
  "Home Win": "Vitória Mandante",
  "Away Win": "Vitória Visitante",
  Draw: "Empate",
  "Over 2.5": "Mais de 2.5 gols",
  "Under 2.5": "Menos de 2.5 gols",
  "Vitória Casa": "Vitória Mandante",
  "Vitória Mandante": "Vitória Mandante",
  "Vitória Visitante": "Vitória Visitante",
  Empate: "Empate",
  "Mais de 2.5 gols": "Mais de 2.5 gols",
  "Menos de 2.5 gols": "Menos de 2.5 gols",
};

const TIER_LABELS: Record<string, string> = {
  Strong: "Forte",
  Medium: "Médio",
  Weak: "Fraco",
  elite: "Elite",
  forte: "Forte",
  moderado: "Moderado",
  neutro: "Neutro",
  negativo: "Negativo",
  unknown: "Desconhecido",
};

const STATUS_LABELS: Record<string, string> = {
  Live: "Ao vivo",
  live: "Ao vivo",
  Kickoff: "Início",
  kickoff: "Início",
};

const LEAGUE_LABELS: Record<string, string> = {
  EPL: "Premier League",
  "Premier League": "Premier League",
  "Serie A - Italy": "Serie A Italiana",
  "Serie A": "Serie A Italiana",
  "La Liga - Spain": "La Liga",
  "La Liga": "La Liga",
  "Ligue 1 - France": "Ligue 1 França",
  "Ligue 1": "Ligue 1 França",
  "Brazil Série A": "Brasileirão Série A",
  "Brazil Serie A": "Brasileirão Série A",
  "Campeonato Brasileiro Série A": "Brasileirão Série A",
};

const SPORT_KEY_LEAGUES: Record<string, string> = {
  soccer_epl: "Premier League",
  soccer_italy_serie_a: "Serie A Italiana",
  soccer_spain_la_liga: "La Liga",
  soccer_france_ligue_one: "Ligue 1 França",
  soccer_brazil_campeonato: "Brasileirão Série A",
};

export function translateMarketName(value: string | null | undefined): string {
  if (!value) return "";
  return MARKET_LABELS[value] ?? value;
}

export function translateTier(value: string | null | undefined): string {
  if (!value) return "";
  return TIER_LABELS[value] ?? value;
}

export function translateStatus(value: string | null | undefined): string {
  if (!value) return "";
  return STATUS_LABELS[value] ?? value;
}

export function translateLeagueName(
  value: string | null | undefined,
  sportKey?: string | null,
): string {
  if (sportKey && SPORT_KEY_LEAGUES[sportKey]) return SPORT_KEY_LEAGUES[sportKey];
  if (!value) return "";
  return LEAGUE_LABELS[value] ?? value;
}
