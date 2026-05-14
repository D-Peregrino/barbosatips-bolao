import { normalizarSlugEditorial } from "@/lib/admin-editorial/normalizar-slug";
import type { IaAnaliseDraft, IaAnaliseInput, IaTemplateId } from "@/lib/admin-editorial/ai-analise/types";
import { attachOpenAiStub } from "@/lib/admin-editorial/ai-analise/openai-future";

function formatarOdd(raw: string): string {
  const n = parseFloat(String(raw).replace(",", ".").trim());
  if (!Number.isFinite(n) || n <= 0) return String(raw).trim() || "—";
  return n.toFixed(2).replace(".", ",");
}

function clampConf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function textoConfianca(c: number): string {
  if (c >= 80) return "leitura agressiva, com convicção estatística e de contexto";
  if (c >= 60) return "cenário equilibrado: valor existe, mas gestão de banca é decisiva";
  return "cenário mais conservador: margem de erro maior; stake reduzido faz sentido";
}

function slugBaseDoJogo(jogo: string): string {
  const base = jogo
    .replace(/\s+x\s+/gi, "-")
    .replace(/\s+vs\.?\s+/gi, "-")
    .replace(/\s+–\s+|\s+-\s+/g, "-");
  return normalizarSlugEditorial(base);
}

function splitJogoTimes(jogo: string): { timeCasa: string; timeFora: string } {
  const j = jogo.trim();
  const parts = j
    .split(/\s+x\s+|\s+vs\.?\s+|\s+–\s+|\s+-\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { timeCasa: parts[0] ?? "", timeFora: parts.slice(1).join(" ") };
  }
  return { timeCasa: "", timeFora: "" };
}

function categoriaPorTemplate(t: IaTemplateId): string {
  switch (t) {
    case "tenis":
      return "Tênis";
    case "nba":
      return "NBA";
    case "correct_score":
      return "Correct score";
    default:
      return "Futebol";
  }
}

function esportePorTemplate(t: IaTemplateId): string {
  switch (t) {
    case "nba":
      return "basquete";
    case "tenis":
      return "tenis";
    default:
      return "futebol";
  }
}

function tagsPorInput(input: IaAnaliseInput): string {
  const base = new Set<string>([
    "BarbosaTips",
    input.template === "correct_score" ? "correct score" : input.template,
    "prognóstico",
    "odds",
  ]);
  const merc = input.mercado.trim().toLowerCase();
  if (merc) merc.split(/[\s,/+]+/).forEach((w) => w.length > 2 && base.add(w));
  const camp = input.campeonato.trim();
  if (camp) base.add(camp);
  return Array.from(base).slice(0, 12).join(", ");
}

function blocoOpcional(dados?: string): string {
  const t = dados?.trim();
  if (!t) return "";
  return `\n\n> **Notas do editor:** ${t.replace(/\n+/g, " ")}\n`;
}

function varianteContexto(t: IaTemplateId, jogo: string, camp: string): string {
  switch (t) {
    case "tenis":
      return `O confronto **${jogo}**${camp ? ` (${camp})` : ""} coloca em cena ritmo de serviço, primeiras bolas e padrões de erro forçado — variáveis que costumam definir quebras e desempates.`;
    case "nba":
      return `No contexto da **NBA**${camp ? ` — ${camp}` : ""}, o duelo **${jogo}** pede leitura de posse, minutos de estrelas e tendência de ritmo (meia-cancha vs transição).`;
    case "correct_score":
      return `Aposta de **placar exato** em **${jogo}**${camp ? ` (${camp})` : ""}: probabilidade naturalmente baixa exige leitura de cenários (favorito controla vs jogo aberto) e honestidade sobre variância.`;
    default:
      return `O **${jogo}**${camp ? `, no âmbito de ${camp},` : ""} chega com narrativa própria: estado de forma, motivação tática e perfil de criação de chances são o fio condutor desta leitura.`;
  }
}

function varianteMomento(t: IaTemplateId): string {
  switch (t) {
    case "tenis":
      return `No **momento dos jogadores**, olhamos para consistência no segundo serviço, conversões em break-point e histórico na superfície. Ajusta a confiança quando houver desnível claro no ranking com condições atípicas (fadiga de calendário).`;
    case "nba":
      return `No **momento das equipas**, o foco vai para sequências recentes de eficiência ofensiva, rebote defensivo e rotações curtas em jogos apertados. Back-to-backs e viagens longas podem mudar o ritmo esperado.`;
    case "correct_score":
      return `No **momento das equipas**, placar exato exige identificar tendência de resultado apertado vs goleada improvável: médias de golos e estilo defensivo são guias — sem prometer certezas.`;
    default:
      return `No **momento das equipas**, comparamos últimos jogos, estabilidade defensiva e capacidade de criar volume ofensivo. Lesões de última hora e gestão de minutos podem alterar o desenho tático — ajusta a stake se o mercado mover rápido.`;
  }
}

function varianteEstatisticas(t: IaTemplateId): string {
  switch (t) {
    case "tenis":
      return `### Estatísticas\n\n- **Serviço:** primeiros serviços em caixa e pontos ganhos no 1.º serviço.\n- **Devolução:** pressão em segundos serviços rivais.\n- **Ritmo:** média de jogos por set (indicador de serviço dominante).\n\nSubstitui por números reais antes de publicar.`;
    case "nba":
      return `### Estatísticas\n\n- **Ritmo (pace)** e posse efetiva.\n- **eFG%** e tendência de triplos vs médio.\n- **Rebote** e segundas oportunidades.\n\nCruza com matchup (defesas fracas no pick-and-roll, etc.).`;
    case "correct_score":
      return `### Estatísticas\n\n- Médias de **golos marcados/sofridos** e distribuição de resultados.\n- **Clean sheets** e padrão de jogos com poucos golos.\n- Probabilidades implícitas vs histórico (sem afirmar “certeza”).`;
    default:
      return `### Estatísticas\n\n- **xG** (criação vs concretização) quando existir.\n- **Pressão e finalização:** remates no alvo e transições.\n- **Cantos / cartões** se o mercado o exigir.\n\nSubstitui por números reais antes de publicar.`;
  }
}

function varianteValorOdd(t: IaTemplateId, mercado: string, oddFmt: string, c: number): string {
  const linha =
    t === "correct_score"
      ? `Em **correct score**, a odd **@${oddFmt}** traduz probabilidade implícita baixa: o “valor” surge quando o teu modelo pessoal diz que o mercado subestima um placar específico — não quando “parece alto”.`
      : `A odd **@${oddFmt}** no mercado **${mercado || "principal"}** deve ser lida contra a tua probabilidade estimada: se o teu modelo aponta edge sustentável, há tese; se não, trata como entretenimento com stake reduzida.`;
  return `### Valor da odd\n\n${linha}\n\nConfiança editorial **${c}%** (${textoConfianca(c)}).`;
}

function variantePrognostico(input: IaAnaliseInput): string {
  const merc = input.mercado.trim() || "mercado escolhido";
  return `### Prognóstico\n\nTese central: **${merc}** — desenvolve em 2–4 frases o porquê, com condicionantes (clima, rotacionais, estilo de jogo). Evita linguagem de garantia; reforça leitura condicional.`;
}

function tituloSugerido(input: IaAnaliseInput, oddFmt: string): string {
  const j = input.jogo.trim();
  const merc = input.mercado.trim();
  switch (input.template) {
    case "correct_score":
      return `${j}: leitura de placar exato e odd @${oddFmt}`;
    case "nba":
      return `${j} — ${merc || "NBA"} na odd @${oddFmt}`;
    case "tenis":
      return `${j}: ${merc || "serviço e breaks"} @${oddFmt}`;
    default:
      return `${j}: ${merc || "prognóstico"} @${oddFmt}`;
  }
}

function resumoSugerido(input: IaAnaliseInput, oddFmt: string, c: number): string {
  const camp = input.campeonato.trim();
  return [
    `Análise ao confronto ${input.jogo.trim()}${camp ? ` (${camp})` : ""}.`,
    `Mercado: ${input.mercado.trim() || "—"} · odd @${oddFmt} · confiança ${c}%.`,
    "Contexto, stats-chave e leitura de valor antes do apito inicial.",
  ].join(" ");
}

function seoTrim(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function conteudoMarkdownCompleto(input: IaAnaliseInput, oddFmt: string, c: number): string {
  const jogo = input.jogo.trim();
  const camp = input.campeonato.trim();
  const merc = input.mercado.trim() || "mercado selecionado";
  const opt = blocoOpcional(input.dadosOpcionais);

  return [
    `# ${jogo}`,
    "",
    `> **Mercado:** ${merc} · **Odd:** @${oddFmt} · **Confiança:** ${c}%`,
    "",
    "## Contexto do jogo",
    "",
    varianteContexto(input.template, jogo, camp) + opt,
    "",
    "## Momento das equipas",
    "",
    varianteMomento(input.template),
    "",
    varianteEstatisticas(input.template),
    "",
    varianteValorOdd(input.template, merc, oddFmt, c),
    "",
    variantePrognostico(input),
    "",
    "## Conclusão",
    "",
    "Fecha a tese em duas frases: o que valida a entrada e o que invalidaria (golos cedo, expulsão, mudança tática). Gestão de banca: stake proporcional à convicção e à variância do mercado.",
    "",
    "---",
    "",
    "### CTA",
    "",
    "**Segue o BarbosaTips** para mais análises com contexto, números e leitura de mercado — e joga sempre com responsabilidade.",
    "",
    `[Ver mais análises](/analises) · [Picks rápidas](/picks)`,
    "",
  ].join("\n");
}

/**
 * Gera rascunho editorial local (sem API).
 * Para OpenAI no futuro: usa `draft.openAiFuture` como payload de partida.
 */
export function generateAnaliseDraftLocal(input: IaAnaliseInput): IaAnaliseDraft {
  const oddFmt = formatarOdd(input.odd);
  const c = clampConf(input.confianca);
  const titulo = tituloSugerido(input, oddFmt);
  const slug = slugBaseDoJogo(input.jogo) || normalizarSlugEditorial(titulo);
  const resumo = resumoSugerido(input, oddFmt, c);
  const seoDescription = seoTrim(resumo, 160);
  const { timeCasa, timeFora } = splitJogoTimes(input.jogo);
  const draft: IaAnaliseDraft = {
    titulo,
    slug,
    resumo,
    conteudoMarkdown: conteudoMarkdownCompleto(input, oddFmt, c),
    tags: tagsPorInput(input),
    categoria: categoriaPorTemplate(input.template),
    seoDescription,
    esporte: esportePorTemplate(input.template),
    campeonato: input.campeonato.trim(),
    oddReferencia: input.odd.trim(),
    confianca: c,
    timeCasa,
    timeFora,
    openAiFuture: {
      modelSuggestion: "gpt-4.1-mini",
      system: "",
      user: "",
    },
  };
  return attachOpenAiStub(draft, input);
}
