import type { QuickPickRow } from "@/lib/picks/types";
import { calcularEstatisticasQuickPicksEncerradas } from "@/lib/picks/stats";

export type HomePerformanceSnapshot = {
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
};

function parseTime(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

/**
 * Agrega métricas para a barra de performance da home (picks recentes em memória).
 */
export function buildHomePerformanceSnapshot(
  picks: QuickPickRow[],
): HomePerformanceSnapshot {
  const { greens, reds, voids, taxaAcertoPct } =
    calcularEstatisticasQuickPicksEncerradas(picks);

  let unidades = 0;
  const resolved: QuickPickRow[] = [];

  for (const p of picks) {
    if (p.status !== "encerrado") continue;
    if (p.resultado === "green") {
      unidades += p.odd > 0 ? p.odd - 1 : 0;
      resolved.push(p);
    } else if (p.resultado === "red") {
      unidades -= 1;
      resolved.push(p);
    }
  }

  const amostra = greens + reds;
  const roiPct =
    amostra > 0 ? Math.round((unidades / amostra) * 1000) / 10 : null;

  const closedGR = picks
    .filter(
      (p) =>
        p.status === "encerrado" &&
        (p.resultado === "green" || p.resultado === "red"),
    )
    .sort((a, b) => parseTime(b.horario_jogo) - parseTime(a.horario_jogo));

  let streakAtual = 0;
  if (closedGR.length > 0) {
    const first = closedGR[0].resultado;
    const sign = first === "green" ? 1 : -1;
    for (const p of closedGR) {
      if (p.resultado !== (sign === 1 ? "green" : "red")) break;
      streakAtual += sign;
    }
  }

  return {
    greens,
    reds,
    voids,
    taxaAcertoPct,
    unidades: Math.round(unidades * 100) / 100,
    roiPct,
    streakAtual,
  };
}
