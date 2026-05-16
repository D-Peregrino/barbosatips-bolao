import type { QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";

export type ResultadoOperacional = "green" | "red" | "void";

const RESULTADOS_OPS: ResultadoOperacional[] = ["green", "red", "void"];

export function parseResultadoOperacional(raw: string): ResultadoOperacional | null {
  const s = raw.toLowerCase().trim();
  return RESULTADOS_OPS.includes(s as ResultadoOperacional)
    ? (s as ResultadoOperacional)
    : null;
}

export function buildEstadoFechamento(
  resultado: ResultadoOperacional,
): { status: QuickPickStatus; resultado: QuickPickResultado } {
  return { status: "encerrado", resultado };
}

export function buildPayloadFechamento(
  resultado: ResultadoOperacional,
  opts?: { placar_final?: string | null; observacao?: string | null },
): Record<string, unknown> {
  const placar = opts?.placar_final?.trim() || null;
  const obs = opts?.observacao?.trim() || null;
  return {
    status: "encerrado",
    resultado,
    resolved_at: new Date().toISOString(),
    placar_final: placar,
    observacao_resultado: obs,
  };
}

export function buildPayloadReabrir(): Record<string, unknown> {
  return {
    status: "ativo",
    resultado: "pendente",
    resolved_at: null,
    placar_final: null,
    observacao_resultado: null,
  };
}
