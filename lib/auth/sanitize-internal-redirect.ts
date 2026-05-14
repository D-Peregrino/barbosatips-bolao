/**
 * Evita open redirect em `?redirect=` / `?next=` após OAuth.
 * Aceita apenas caminhos relativos do mesmo origin.
 */
export function sanitizeInternalRedirect(
  raw: string | null | undefined,
  origin: string,
  fallback = "/meu-feed",
): string {
  if (raw == null || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("\\") || t.includes("\0")) return fallback;
  try {
    const abs = new URL(t, origin);
    const base = new URL(origin);
    if (abs.origin !== base.origin) return fallback;
    return abs.pathname + abs.search + abs.hash;
  } catch {
    return fallback;
  }
}
