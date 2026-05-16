export type SalvarAnaliseEditorialResult =
  | { ok: true }
  | { ok: false; error: string };

/** Mesmo contrato das actions de gravar/excluir editorial. */
export type ExcluirAnaliseEditorialResult = SalvarAnaliseEditorialResult;
