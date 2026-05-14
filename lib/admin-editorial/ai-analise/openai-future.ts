import type { IaAnaliseDraft, IaAnaliseInput } from "@/lib/admin-editorial/ai-analise/types";

/**
 * Contrato futuro para integração OpenAI (sem rede nem custo neste fase).
 * Quando `OPENAI_API_KEY` existir no servidor, um server action pode:
 * 1. Enviar `system` + `user`
 * 2. Validar JSON / markdown devolvido
 * 3. Mapear para `IaAnaliseDraft`
 */
export const OPENAI_SYSTEM_ANALISE_BARBOSA_PT = [
  "És redator sénior do portal BarbosaTips (Portugal/Brasil).",
  "Escreve em português europeu com clareza, tom confiante e responsável.",
  "Inclui aviso implícito de jogo responsável quando falares em stakes.",
  "Nunca inventes resultados ou lesões sem fonte; usa formulações condicionais.",
  "Devolve estrutura fixa em markdown com secções: Contexto do jogo; Momento das equipas (ou jogadores); Estatísticas; Valor da odd; Prognóstico; Conclusão; CTA final.",
].join(" ");

export function buildOpenAiUserEnvelope(input: IaAnaliseInput): string {
  return [
    "Gera uma análise editorial completa com base nos dados:",
    JSON.stringify(
      {
        jogo: input.jogo,
        campeonato: input.campeonato,
        mercado: input.mercado,
        odd: input.odd,
        confianca: input.confianca,
        dadosOpcionais: input.dadosOpcionais ?? "",
        template: input.template,
      },
      null,
      2,
    ),
    "",
    "Resposta desejada (ordem):",
    "1) titulo (string curta, editorial)",
    "2) resumo (2–3 frases, ≤320 chars)",
    "3) tags (lista separada por vírgulas)",
    "4) categoria (string curta)",
    "5) seoDescription (≤160 chars)",
    "6) conteudoMarkdown (markdown com as secções pedidas no system)",
  ].join("\n");
}

export function attachOpenAiStub(draft: IaAnaliseDraft, input: IaAnaliseInput): IaAnaliseDraft {
  return {
    ...draft,
    openAiFuture: {
      modelSuggestion: "gpt-4.1-mini",
      system: OPENAI_SYSTEM_ANALISE_BARBOSA_PT,
      user: buildOpenAiUserEnvelope(input),
    },
  };
}
