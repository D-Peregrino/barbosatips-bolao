import type { QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";

export type ResultadoOperacional = "green" | "red" | "void";

const RESULTADOS_OPS: ResultadoOperacional[] = ["green", "red", "void"];
const QUICK_PICK_UPDATE_WHITELIST = ["status", "resultado"] as const;

type QuickPickUpdateField = (typeof QUICK_PICK_UPDATE_WHITELIST)[number];
type QuickPickUpdatePayload = Pick<
  {
    status: QuickPickStatus;
    resultado: QuickPickResultado;
  },
  QuickPickUpdateField
>;

function quickPickUpdatePayload(payload: QuickPickUpdatePayload): Record<string, unknown> {
  return Object.fromEntries(
    QUICK_PICK_UPDATE_WHITELIST.map((field) => [field, payload[field]]),
  );
}

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

export function buildPayloadFechamento(resultado: ResultadoOperacional): Record<string, unknown> {
  return quickPickUpdatePayload({
    status: "encerrado",
    resultado,
  });
}

export function buildPayloadReabrir(): Record<string, unknown> {
  return quickPickUpdatePayload({
    status: "ativo",
    resultado: "pendente",
  });
}
