/**
 * Erros desconhecidos → mensagem segura para UI (sem stack em produção).
 */
export function errorMessageForUser(err: unknown): string {
  if (err instanceof Error) {
    if (process.env.NODE_ENV === "development") return err.message || "Erro inesperado.";
    return "Algo correu mal. Tenta de novo dentro de momentos.";
  }
  return "Algo correu mal. Tenta de novo dentro de momentos.";
}

export function isAbortError(err: unknown): boolean {
  return err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
}
