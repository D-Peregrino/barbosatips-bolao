/** Identificador estável por bloco (gerado no CMS). */
export type StatBlockBase = {
  id: string;
  /** Título opcional sobre o cartão. */
  title?: string;
};

export type StatBlockProbability1x2 = StatBlockBase & {
  kind: "probability_1x2";
  /** Percentagens 0–100 (vitória time casa, empate, vitória visitante). */
  vitoriaCasa: number;
  empate: number;
  vitoriaFora: number;
  labelCasa?: string;
  labelFora?: string;
};

export type StatBlockFairOdd = StatBlockBase & {
  kind: "fair_odd";
  oddJusta: number;
  oddMercado?: number;
  mercado?: string;
  nota?: string;
};

export type StatBlockEvPlus = StatBlockBase & {
  kind: "ev_plus";
  /** Valor em percentagem, ex.: 4.2 = +4.2% EV */
  evPercent: number;
  probModelo?: number;
  probImplicita?: number;
  nota?: string;
};

export type StatBlockFormRecent = StatBlockBase & {
  kind: "form_recent";
  /** "W"|"D"|"L"|"?" por jogo, mais recente primeiro. */
  sequenciaCasa: string;
  sequenciaFora: string;
};

export type StatBlockH2h = StatBlockBase & {
  kind: "h2h";
  linhas: { data?: string; resultado: string; placar?: string }[];
};

export type StatBlockExpectedGoals = StatBlockBase & {
  kind: "expected_goals";
  xgCasa: number;
  xgFora: number;
  xgaCasa?: number;
  xgaFora?: number;
};

export type StatBlockOverUnder = StatBlockBase & {
  kind: "over_under";
  linha: number;
  overPercent: number;
  underPercent: number;
  contexto?: string;
};

export type StatBlockHeatmapSimple = StatBlockBase & {
  kind: "heatmap_simple";
  rows: number;
  cols: number;
  /** Intensidades 0–1, row-major (rows*cols). */
  cells: number[];
  labelLinhas?: string;
  labelColunas?: string;
};

export type StatBlockCompareChart = StatBlockBase & {
  kind: "compare_chart";
  /** Valores 0–100 para barras comparativas. */
  metricas: { label: string; casa: number; fora: number }[];
};

export type StatBlockConfidenceBar = StatBlockBase & {
  kind: "confidence_bar";
  value: number;
  subtitulo?: string;
};

export type StatBlock =
  | StatBlockProbability1x2
  | StatBlockFairOdd
  | StatBlockEvPlus
  | StatBlockFormRecent
  | StatBlockH2h
  | StatBlockExpectedGoals
  | StatBlockOverUnder
  | StatBlockHeatmapSimple
  | StatBlockCompareChart
  | StatBlockConfidenceBar;

export type StatBlocksPayload = StatBlock[];
