/** Reconhece status publicado nos schemas editorial novo e legado. */
export function statusPublicadoNormalizado(status: unknown): boolean {
  const s = String(status ?? "").toLowerCase().trim();
  return s === "publicado" || s === "published";
}
