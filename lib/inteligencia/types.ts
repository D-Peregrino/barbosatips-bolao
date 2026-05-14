/**
 * Contrato de dados da Central de Inteligência.
 * Hoje preenchido por mocks; substituir por feeds de odds / tracking / modelo ML.
 */

export type SportId = "football" | "tennis" | "nba";

export type DataSourceTag = "mock_v1" | "api_live" | "ml_pipeline";

export type FairOddsRow = {
  id: string;
  market: string;
  selection: string;
  bookImplied: number;
  fairImplied: number;
  edgePct: number;
};

export type EvPositiveRow = {
  id: string;
  market: string;
  fairProb: number;
  bestOdds: number;
  impliedFromOdds: number;
  evPct: number;
};

export type OutcomeProb = {
  label: string;
  prob: number;
};

export type CorrectScoreCell = {
  home: number;
  away: number;
  pct: number;
};

export type HeatmapZone = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  intensity: number;
  label: string;
};

export type XgSplit = {
  team: string;
  xg: number;
  shots: number;
  onTarget: number;
};

export type FormPoint = {
  label: string;
  /** 1 vitória, 0 empate, -1 derrota (futebol); ténis/NBA: normalizado -1..1 */
  value: number;
};

export type ComparisonMetric = {
  key: string;
  left: string | number;
  right: string | number;
  unit?: string;
  lean?: "left" | "right" | "neutral";
};

export type TrendSeries = {
  id: string;
  name: string;
  color: string;
  points: { t: string; v: number }[];
};

export type AutoInsight = {
  id: string;
  severity: "info" | "positive" | "warn";
  title: string;
  detail: string;
  tags: string[];
};

export type InteligenciaFixture = {
  id: string;
  kickoffLabel: string;
  home: string;
  away: string;
  competition: string;
};

export type InteligenciaSnapshot = {
  meta: {
    source: DataSourceTag;
    generatedAt: string;
    sport: SportId;
    modelVersion: string;
    /** Reservado para pipeline ML / IA explicativa */
    pipelineNotes: string[];
  };
  fixture: InteligenciaFixture;
  fairOdds: FairOddsRow[];
  evPositive: EvPositiveRow[];
  probabilities: {
    blockTitle: string;
    outcomes: OutcomeProb[];
  }[];
  correctScores: CorrectScoreCell[];
  heatmap: { title: string; zones: HeatmapZone[]; pitchRatio: { w: number; h: number } };
  xg: { title: string; splits: XgSplit[] };
  form: { title: string; sideLeft: string; sideRight: string; left: FormPoint[]; right: FormPoint[] };
  comparison: ComparisonMetric[];
  trends: TrendSeries[];
  insights: AutoInsight[];
};

export type InteligenciaFilterState = {
  competition: string;
  query: string;
};
