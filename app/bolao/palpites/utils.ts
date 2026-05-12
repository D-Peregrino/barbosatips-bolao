export const MSG_PALPITES_ENCERRADOS_JOGO =
  "Palpites encerrados para este jogo.";

export type VerificarPalpitesBolaoResult =
  | {
      ok: true;
      placares: Record<string, { casa: string; fora: string }>;
      confirmado: boolean;
    }
  | { ok: false; error: string };

export type SalvarPalpitesBolaoResult =
  | { ok: true }
  | { ok: false; error: string };
