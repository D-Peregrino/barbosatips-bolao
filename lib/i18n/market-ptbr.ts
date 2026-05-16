const MARKET_LABELS: Record<string, string> = {
  "Home Win": "Vitória Casa",
  "Away Win": "Vitória Visitante",
  Draw: "Empate",
  "Over 2.5": "Mais de 2.5 gols",
  "Under 2.5": "Menos de 2.5 gols",
  "Vitória Casa": "Vitória Casa",
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
