/**
 * Tempo relativo em pt-BR (portal “ao vivo”): "há 2 min", "há 1 hora", etc.
 * `now` omisso = instante do render (SSR alinhado ao pedido).
 */
export function relativeTimeAgoPt(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const sec = Math.floor((now - t) / 1000);
  if (sec < 45) return "agora";
  if (sec < 90) return "há 1 min";
  const min = Math.floor(sec / 60);
  if (min < 60) {
    if (min <= 1) return "há 1 min";
    return `há ${min} min`;
  }
  const h = Math.floor(min / 60);
  if (h < 24) {
    if (h === 1) return "há 1 hora";
    return `há ${h} horas`;
  }
  const d = Math.floor(h / 24);
  if (d < 14) {
    if (d === 1) return "há 1 dia";
    return `há ${d} dias`;
  }
  const w = Math.floor(d / 7);
  if (w <= 8) {
    if (w <= 1) return "há 1 semana";
    return `há ${w} semanas`;
  }
  const mo = Math.floor(d / 30);
  if (mo < 12) {
    if (mo <= 1) return "há 1 mês";
    return `há ${mo} meses`;
  }
  const y = Math.floor(d / 365);
  if (y <= 1) return "há 1 ano";
  return `há ${y} anos`;
}

/** @deprecated Usar `relativeTimeAgoPt` — mantido para imports antigos. */
export const minutosAtrasPt = relativeTimeAgoPt;
