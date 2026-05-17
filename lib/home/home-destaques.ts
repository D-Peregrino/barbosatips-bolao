import type { AnaliseRow } from "@/lib/analises/types";

const MAX_SECUNDARIOS = 4;

export type HomeDestaquesResolvidos = {
  principal: AnaliseRow | null;
  secundarios: AnaliseRow[];
  slugsUsados: Set<string>;
};

/**
 * Hero e secundários usam o lote recente publicado.
 * As colunas antigas de destaque não existem no Supabase atual.
 */
export function resolverDestaquesHomeEditorial(
  destaquesPublicados: AnaliseRow[],
  fallbackUltimas: AnaliseRow[],
): HomeDestaquesResolvidos {
  const principal = destaquesPublicados[0] ?? fallbackUltimas[0] ?? null;

  const secundarios = [...destaquesPublicados, ...fallbackUltimas]
    .filter((a) => a.slug && a.slug !== principal?.slug)
    .slice(0, MAX_SECUNDARIOS);
  const slugsUsados = new Set<string>();
  if (principal?.slug) slugsUsados.add(principal.slug);
  for (const item of secundarios) slugsUsados.add(item.slug);

  return {
    principal,
    secundarios,
    slugsUsados,
  };
}

export function excluirSlugsDaLista(
  analises: AnaliseRow[],
  slugs: Set<string>,
): AnaliseRow[] {
  if (slugs.size === 0) return analises;
  return analises.filter((a) => !slugs.has(a.slug));
}
