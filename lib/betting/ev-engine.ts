/**
 * Motor de valor esperado (EV) — cruza probabilidade estimada (ex.: tendências API-Football)
 * com odds de mercado (ex.: The Odds API).
 *
 * Convenção: probabilidades em escala 0–100 (%), odds em formato decimal europeu.
 */

export type EvTier = "elite" | "forte" | "moderado" | "neutro" | "negativo";

export type MarketInsight = {
  marketLabel: string | null;
  fairOdd: number;
  marketOdd: number;
  impliedProbability: number;
  realProbability: number;
  edge: number;
  ev: number;
  tier: EvTier;
};

export type GenerateMarketInsightInput = {
  /** Nome do mercado (ex.: "Over 2.5"). */
  marketLabel?: string | null;
  /** Probabilidade estimada/real em % (0–100) ou decimal (0–1). */
  realProbability: number;
  /** Odd decimal do mercado. */
  marketOdd: number;
};

/** Garante probabilidade na escala 0–100. Aceita 0–1 como decimal. */
export function normalizeProbabilityPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Probabilidade inválida");
  }
  if (value > 0 && value <= 1) return value * 100;
  return value;
}

/**
 * Probabilidade implícita da odd (%).
 * Fórmula: 100 / odd
 */
export function impliedProbability(odd: number): number {
  if (!Number.isFinite(odd) || odd <= 1) {
    throw new Error("Odd inválida (deve ser > 1)");
  }
  return round((100 / odd) * 100) / 100;
}

/**
 * Odd justa a partir da probabilidade (%).
 * Fórmula: 100 / probability
 */
export function fairOdd(probability: number): number {
  const pct = normalizeProbabilityPercent(probability);
  if (pct <= 0 || pct >= 100) {
    throw new Error("Probabilidade deve estar entre 0 e 100 (exclusivo)");
  }
  return round((100 / pct) * 1000) / 1000;
}

/**
 * Valor esperado (EV) em formato decimal.
 * Fórmula: (realProbability * marketOdd) - 1
 * `realProbability` aceita % (67) ou decimal (0.67).
 */
export function calculateEV(realProbability: number, marketOdd: number): number {
  const pct = normalizeProbabilityPercent(realProbability);
  const p = pct / 100;
  if (!Number.isFinite(marketOdd) || marketOdd <= 1) {
    throw new Error("Odd de mercado inválida");
  }
  return round(((p * marketOdd) - 1) * 10000) / 10000;
}

/**
 * Classificação do EV.
 * - elite: EV >= 15%
 * - forte: EV >= 8%
 * - moderado: EV >= 3%
 * - neutro: 0 <= EV < 3%
 * - negativo: EV < 0
 */
export function classifyEV(ev: number): EvTier {
  if (!Number.isFinite(ev)) return "negativo";
  if (ev >= 0.15) return "elite";
  if (ev >= 0.08) return "forte";
  if (ev >= 0.03) return "moderado";
  if (ev >= 0) return "neutro";
  return "negativo";
}

/**
 * Gera insight completo para um mercado (fair odd, edge, EV, tier).
 * `edge` = realProbability (%) − impliedProbability (%) em pontos percentuais.
 */
export function generateMarketInsight(input: GenerateMarketInsightInput): MarketInsight {
  const realProbability = round(
    normalizeProbabilityPercent(input.realProbability) * 100,
  ) / 100;
  const marketOdd = input.marketOdd;
  const implied = impliedProbability(marketOdd);
  const fair = fairOdd(realProbability);
  const ev = calculateEV(realProbability, marketOdd);
  const edge = round((realProbability - implied) * 100) / 100;

  return {
    marketLabel: input.marketLabel?.trim() || null,
    fairOdd: fair,
    marketOdd: round(marketOdd * 1000) / 1000,
    impliedProbability: implied,
    realProbability,
    edge,
    ev,
    tier: classifyEV(ev),
  };
}

/** Valor de mercado: edge positivo e EV acima do limiar moderado. */
export function hasMarketValue(insight: MarketInsight): boolean {
  return insight.ev >= 0.03 && insight.edge > 0;
}

/**
 * Cruza tendência (% da API-Football ou modelo) com odd de mercado.
 * Ex.: trends.over25Pct + odd do mercado "totals" Over 2.5.
 */
export function generateMarketInsightFromTrend(params: {
  marketLabel: string;
  trendProbabilityPct: number;
  marketOdd: number;
}): MarketInsight {
  return generateMarketInsight({
    marketLabel: params.marketLabel,
    realProbability: params.trendProbabilityPct,
    marketOdd: params.marketOdd,
  });
}

function round(n: number): number {
  return Math.round(n);
}

/** Formata insight para resposta API de teste. */
export function formatInsightForApi(insight: MarketInsight) {
  return {
    market: insight.marketLabel,
    fairOdd: insight.fairOdd,
    marketOdd: insight.marketOdd,
    impliedProbability: insight.impliedProbability,
    realProbability: insight.realProbability,
    edge: insight.edge,
    ev: insight.ev,
    tier: insight.tier,
    hasValue: hasMarketValue(insight),
  };
}
