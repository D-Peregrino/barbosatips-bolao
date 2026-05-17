import type { AnaliseRow } from "@/lib/analises/types";
import { parseBoolCol, parsePrioridadeCol } from "@/lib/analises/parse-columns";

export type DestaqueFormValues = {
  destaque_principal: boolean;
  prioridade: number;
};

export function parseDestaqueForm(formData: FormData): DestaqueFormValues {
  const destaquePrincipal = parseBoolCol(formData.get("destaque_principal"));
  return {
    destaque_principal: destaquePrincipal,
    prioridade: parsePrioridadeCol(formData.get("prioridade")),
  };
}

/** Maior prioridade primeiro; empate por data mais recente. */
export function compararPrioridadeDestaque(a: AnaliseRow, b: AnaliseRow): number {
  if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function ordenarPorPrioridadeDestaque(rows: AnaliseRow[]): AnaliseRow[] {
  return [...rows].sort(compararPrioridadeDestaque);
}

export function slugsDestaquesUsados(
  principal: AnaliseRow | null,
  secundarios: AnaliseRow[],
): Set<string> {
  const s = new Set<string>();
  if (principal?.slug) s.add(principal.slug);
  for (const a of secundarios) {
    if (a.slug) s.add(a.slug);
  }
  return s;
}
