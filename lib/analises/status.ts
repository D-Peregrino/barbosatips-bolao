/** Regra temporária: mostra qualquer análise que não esteja explicitamente em rascunho. */
export function statusPublicadoNormalizado(status: unknown): boolean {
  const s = String(status ?? "").toLowerCase().trim();
  return s.length > 0 && s !== "rascunho";
}
