import { calcularEstatisticasQuickPicksEncerradas } from "@/lib/picks/stats";
import type { QuickPickRow } from "@/lib/picks/types";

export type SportHubStats = ReturnType<
  typeof calcularEstatisticasQuickPicksEncerradas
> & {
  totalPicks: number;
  picksAtivas: number;
  analisesCount: number;
};

export function buildSportHubStats(
  picks: QuickPickRow[],
  analisesCount: number,
): SportHubStats {
  const enc = calcularEstatisticasQuickPicksEncerradas(picks);
  return {
    ...enc,
    totalPicks: picks.length,
    picksAtivas: picks.filter((p) => p.status === "ativo").length,
    analisesCount,
  };
}
