const BRAZIL_TZ = "America/Sao_Paulo";

/** Data de hoje no fuso de São Paulo (YYYY-MM-DD). */
export function todayDateBrazil(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BRAZIL_TZ }).format(new Date());
}

export function formatKickoffPt(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: BRAZIL_TZ,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
