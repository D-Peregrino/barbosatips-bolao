import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";

export function melhoresGreens(picks: QuickPickRow[], n: number): QuickPickRow[] {
  return picks
    .filter((p) => p.status === "encerrado" && p.resultado === "green")
    .sort((a, b) => b.odd - a.odd)
    .slice(0, n);
}

export function picksQuentes(picks: QuickPickRow[], n: number): QuickPickRow[] {
  const ativos = picks.filter((p) => p.status === "ativo");
  const seen = new Set(ativos.map((p) => p.id));
  const porConf = [...picks]
    .filter((p) => !seen.has(p.id))
    .sort((a, b) => b.confianca - a.confianca);
  return [...ativos, ...porConf].slice(0, n);
}

export function trendingPicks(
  picks: QuickPickRow[],
  n: number,
  excludeIds: Set<string>,
): QuickPickRow[] {
  return [...picks]
    .filter((p) => !excludeIds.has(p.id))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, n);
}

export function analisesRecentesParaGrid(
  analises: AnaliseRow[],
  skipFirst: boolean,
  n: number,
): AnaliseRow[] {
  const slice = skipFirst ? analises.slice(1) : analises;
  return slice.slice(0, n);
}
