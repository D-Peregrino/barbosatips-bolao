/** Texto curto em pt-BR para diferença em minutos (relativo ao `now`). */
export function minutosAtrasPt(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "há pouco";
  const m = Math.floor((now - t) / 60_000);
  if (m < 1) return "agora";
  if (m === 1) return "há 1 min";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h === 1) return "há 1 h";
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "há 1 dia";
  return `há ${d} dias`;
}
