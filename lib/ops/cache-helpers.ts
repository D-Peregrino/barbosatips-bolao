/**
 * Helpers para cache previsível em rotas/Route Handlers (documentação + constantes).
 * Evitar `revalidate: 0` em loops — preferir limites explícitos por rota.
 */
export const CACHE_PROFILES = {
  /** Dados quase estáticos (ex.: config). */
  staticLong: { revalidate: 3600 as const },
  /** Listagens editoriais. */
  editorial: { revalidate: 300 as const },
  /** Polling curto (ex.: live). */
  liveShort: { revalidate: 15 as const },
} as const;

/** Hash estável para chaves derivadas (evita object identity em deps). */
export function stableSerializeKey(parts: unknown[]): string {
  return parts.map((p) => JSON.stringify(p)).join("|");
}
