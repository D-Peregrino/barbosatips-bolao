/** Mensagem alinhada ao selo na UI e às respostas da API quando o prazo (início − 15 min) passou. */
export const MSG_PALPITES_ENCERRADOS_JOGO = "Palpites encerrados";

/** Texto exibido no bolão e retornado pela API quando a inscrição ainda não foi paga. */
export const MSG_BOLAO_CONFIRME_PAGAMENTO_INSCRICAO =
  "Confirme sua inscrição realizando o pagamento.";

export type VerificarPalpitesBolaoResult =
  | {
      ok: true;
      placares: Record<string, { casa: string; fora: string }>;
      confirmado: boolean;
      /** Inscrição com pagamento confirmado no painel admin (`inscricoes_bolao.pago`). */
      pago: boolean;
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
