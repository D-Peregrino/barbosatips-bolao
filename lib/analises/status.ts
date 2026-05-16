/** Reconhece publicado com qualquer capitalização ou espaços extra. */
export function statusPublicadoNormalizado(status: unknown): boolean {
  return String(status ?? "").toLowerCase().trim() === "publicado";
}
