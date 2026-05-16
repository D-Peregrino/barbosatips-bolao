import {
  computePerformancePeriodStats,
  type PerformancePeriodId,
} from "@/lib/picks/performance-periods";
import type { QuickPickRow } from "@/lib/picks/types";
import type { GerarPostPageData } from "@/lib/social-posts/gerar-post-data";

export function latestByResultado(
  picks: QuickPickRow[],
  resultado: "green" | "red",
): QuickPickRow | null {
  return (
    picks.find(
      (p) => p.status === "encerrado" && p.resultado === resultado,
    ) ?? null
  );
}

export function latestAtiva(picks: QuickPickRow[]): QuickPickRow | null {
  return picks.find((p) => p.status === "ativo") ?? picks[0] ?? null;
}

export function resolveDefaultPick(
  picks: QuickPickRow[],
  kind: "green" | "red" | "nova",
): QuickPickRow | null {
  if (kind === "green") return latestByResultado(picks, "green");
  if (kind === "red") return latestByResultado(picks, "red");
  return latestAtiva(picks);
}

export function perfForPeriod(
  data: GerarPostPageData,
  period: PerformancePeriodId,
) {
  if (period === "7d") return data.perf7d;
  if (period === "30d") return data.perf30d;
  return computePerformancePeriodStats(data.picks, period);
}
