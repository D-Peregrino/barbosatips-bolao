export function parseBoolCol(v: unknown): boolean {
  return v === true || v === "true" || String(v ?? "").toLowerCase() === "t";
}

export function parsePrioridadeCol(v: unknown): number {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.min(9999, Math.max(0, Math.round(n)));
}
