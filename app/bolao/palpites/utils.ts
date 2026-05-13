/** Mensagem alinhada ao selo na UI e às respostas da API quando o prazo (início − 15 min) passou. */
export const MSG_PALPITES_ENCERRADOS_JOGO = "Palpites encerrados";

export type VerificarPalpitesBolaoResult =
  | {
      ok: true;
      placares: Record<string, { casa: string; fora: string }>;
      confirmado: boolean;
      /**
       * true somente onde existe linha em `palpites_bolao` para esta inscrição e o jogo.
       * Não inferir pelo placar do formulário.
       */
      palpitePersistidoPorJogo: Record<string, boolean>;
    }
  | { ok: false; error: string };

export type SalvarPalpitesBolaoResult =
  | { ok: true }
  | { ok: false; error: string };
