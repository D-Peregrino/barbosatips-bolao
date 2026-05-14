import { slugifyPath } from "@/lib/sport-routes";

export { slugifyPath };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Normaliza id UUID para minúsculas (URLs canónicas). */
export function normalizePickId(raw: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function isLikelyUuidPickId(raw: string): boolean {
  return UUID_RE.test(normalizePickId(raw));
}
