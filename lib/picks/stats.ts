import type { QuickPickRow } from "@/lib/picks/types";

export type QuickPickStatsResumo = {
  greens: number;
  reds: number;
  voids: number;
  /** greens + reds (void não entra na taxa). */
  amostraTaxa: number;
  /** Percentagem 0–100 ou null se não houver greens+reds encerrados. */
  taxaAcertoPct: number | null;
};

/**
 * Estatísticas apenas de picks **encerradas** (greens, reds, voids e taxa em greens/(greens+reds)).
 */
export function calcularEstatisticasQuickPicksEncerradas(
  picks: QuickPickRow[],
): QuickPickStatsResumo {
  let greens = 0;
  let reds = 0;
  let voids = 0;

  for (const p of picks) {
    if (p.status !== "encerrado") continue;
    if (p.resultado === "green") greens += 1;
    else if (p.resultado === "red") reds += 1;
    else if (p.resultado === "void") voids += 1;
  }

  const amostraTaxa = greens + reds;
  const taxaAcertoPct =
    amostraTaxa > 0
      ? Math.round((greens / amostraTaxa) * 1000) / 10
      : null;

  return { greens, reds, voids, amostraTaxa, taxaAcertoPct };
}
