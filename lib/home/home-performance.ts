import {
  computePerformancePeriodStats,
  type PerformancePeriodId,
} from "@/lib/picks/performance-periods";
import type { QuickPickRow } from "@/lib/picks/types";

export type HomePerformanceSnapshot = {
  periodLabel: string;
  totalResolvidas: number;
  greens: number;
  reds: number;
  voids: number;
  taxaAcertoPct: number | null;
  /** Stake plano 1u: lucro em greens (odd−1), −1 em reds. */
  unidades: number;
  /** Yield médio por pick resolvida (green+red): unidades / amostra × 100. */
  roiPct: number | null;
  /** Vitórias seguidas (desde a pick encerrada mais recente), ou derrotas como negativo. */
  streakAtual: number;
  streakMaximaGreen: number;
};

const HOME_PERF_PERIOD: PerformancePeriodId = "30d";

/**
 * Métricas da home com filtro de período (30 dias, fuso BR).
 */
export function buildHomePerformanceSnapshot(
  picks: QuickPickRow[],
): HomePerformanceSnapshot {
  const s = computePerformancePeriodStats(picks, HOME_PERF_PERIOD);

  return {
    periodLabel: s.label,
    totalResolvidas: s.totalResolvidas,
    greens: s.greens,
    reds: s.reds,
    voids: s.voids,
    taxaAcertoPct: s.winratePct,
    unidades: s.lucroUnidades,
    roiPct: s.roiPct,
    streakAtual: s.streakAtual,
    streakMaximaGreen: s.streakMaximaGreen,
  };
}
