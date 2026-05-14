/**
 * Interpreta `datetime-local` como horário de Brasília (sem DST desde 2019).
 */
export function parseHorarioJogoBrasilia(raw: string): Date {
  const t = String(raw ?? "").trim();
  if (!t) return new Date(NaN);
  const withSec = t.length === 16 ? `${t}:00` : t;
  return new Date(`${withSec}-03:00`);
}
