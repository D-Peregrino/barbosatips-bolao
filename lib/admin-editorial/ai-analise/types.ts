export type IaTemplateId = "futebol" | "tenis" | "nba" | "correct_score";

export type IaAnaliseInput = {
  jogo: string;
  campeonato: string;
  mercado: string;
  odd: string;
  confianca: number;
  dadosOpcionais?: string;
  template: IaTemplateId;
};

export type IaAnaliseDraft = {
  titulo: string;
  slug: string;
  resumo: string;
  /** Markdown editorial (estrutura padrão BarbosaTips). */
  conteudoMarkdown: string;
  tags: string;
  categoria: string;
  /** Sugestão ≤160 caracteres — no site vira `resumo` (meta description). */
  seoDescription: string;
  /** Hub público (`siteConfig.sports`). */
  esporte: string;
  /** Eco do formulário editorial. */
  campeonato: string;
  /** Odd tal como introduzida (formulário). */
  oddReferencia: string;
  confianca: number;
  /** Sugestão a partir do campo “Jogo” (ex.: `A x B`). */
  timeCasa: string;
  timeFora: string;
  /** Pacote pronto para enviar à API OpenAI no futuro (sem chamada aqui). */
  openAiFuture: {
    modelSuggestion: "gpt-4.1-mini" | "gpt-4.1";
    system: string;
    user: string;
  };
};

export const IA_TEMPLATE_OPTIONS: { id: IaTemplateId; label: string; hint: string }[] = [
  { id: "futebol", label: "Futebol", hint: "Confronto, forma e leitura de mercado em campo." },
  { id: "tenis", label: "Tênis", hint: "Sets, serviço e superfície." },
  { id: "nba", label: "NBA", hint: "Ritmo, minutos-chave e linha de totais/handicap." },
  { id: "correct_score", label: "Correct score", hint: "Placar exato — risco, probabilidade e cenários." },
];
