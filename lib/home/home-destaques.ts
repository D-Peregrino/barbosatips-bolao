import type { AnaliseRow } from "@/lib/analises/types";
import {
  compararPrioridadeDestaque,
  ordenarPorPrioridadeDestaque,
  slugsDestaquesUsados,
} from "@/lib/analises/destaque";

const MAX_SECUNDARIOS = 4;

export type HomeDestaquesResolvidos = {
  principal: AnaliseRow | null;
  secundarios: AnaliseRow[];
  slugsUsados: Set<string>;
};

/**
 * Hero = `destaque_principal` (maior prioridade); secundários = `destaque_home`.
 * Fallback do hero: primeira análise recente publicada.
 */
export function resolverDestaquesHomeEditorial(
  destaquesPublicados: AnaliseRow[],
  fallbackUltimas: AnaliseRow[],
): HomeDestaquesResolvidos {
  const ordenados = ordenarPorPrioridadeDestaque(destaquesPublicados);

  const candidatosPrincipal = ordenados.filter((a) => a.destaque_principal);
  const principal =
    candidatosPrincipal.sort(compararPrioridadeDestaque)[0] ??
    fallbackUltimas[0] ??
    null;

  const secundarios = ordenados
    .filter(
      (a) =>
        a.destaque_home &&
        a.slug &&
        a.slug !== principal?.slug &&
        !a.destaque_principal,
    )
    .slice(0, MAX_SECUNDARIOS);

  return {
    principal,
    secundarios,
    slugsUsados: slugsDestaquesUsados(principal, secundarios),
  };
}

export function excluirSlugsDaLista(
  analises: AnaliseRow[],
  slugs: Set<string>,
): AnaliseRow[] {
  if (slugs.size === 0) return analises;
  return analises.filter((a) => !slugs.has(a.slug));
}
