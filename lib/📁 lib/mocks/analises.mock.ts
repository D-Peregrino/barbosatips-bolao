// lib/mocks/analises.mock.ts
// Fonte única de análises enquanto o Supabase não está conectado.
// Remova e reconecte analisesService quando o banco estiver pronto.

export type AnaliseStatus = "pendente" | "green" | "red" | "push";

export type AnaliseSport =
  | "futebol"
  | "basquete"
  | "futebol-americano"
  | "tenis"
  | "mma"
  | "esports";

export interface AnaliseCardData {
  id:          string;
  slug:        string;
  titulo:      string;
  resumo:      string;
  esporte:     AnaliseSport;
  campeonato:  string;
  jogo:        string;
  autor:       string;
  dataPublicacao: string;       // ISO ou "dd/MM/yyyy"
  tempoLeitura:   number;       // minutos
  views:          number;
  isPremium:      boolean;
  // tip associada (opcional)
  tip?: {
    selecao:  string;
    odd:      number;
    status:   AnaliseStatus;
  };
}

export const ANALISES_MOCK: AnaliseCardData[] = [
  {
    id:          "1",
    slug:        "flamengo-x-palmeiras-analise-rodada-12",
    titulo:      "Flamengo tem vantagem histórica no Maracanã — por que a odd está errada",
    resumo:      "Nos últimos 8 confrontos como mandante, o Fla venceu 6. O mercado está precificando risco excessivo por causa do desfalque de Arrascaeta.",
    esporte:     "futebol",
    campeonato:  "Brasileirão Série A",
    jogo:        "Flamengo × Palmeiras",
    autor:       "barbosa",
    dataPublicacao: "2025-06-14T10:00:00",
    tempoLeitura:   5,
    views:          1247,
    isPremium:      false,
    tip: { selecao: "Flamengo vence", odd: 2.15, status: "pendente" },
  },
  {
    id:          "2",
    slug:        "celtics-knicks-playoffs-over-214",
    titulo:      "Celtics × Knicks: Por que Over 214.5 tem valor claro nos playoffs",
    resumo:      "As últimas 5 partidas deste confronto nos playoffs terminaram com média de 221 pontos. O pace acelerado dos dois times favorece o Over.",
    esporte:     "basquete",
    campeonato:  "NBA Playoffs",
    jogo:        "Celtics × Knicks",
    autor:       "barbosa",
    dataPublicacao: "2025-06-13T14:00:00",
    tempoLeitura:   4,
    views:          893,
    isPremium:      false,
    tip: { selecao: "Over 214.5 pts", odd: 1.87, status: "green" },
  },
  {
    id:          "3",
    slug:        "djokovic-alcaraz-roland-garros-analise",
    titulo:      "Roland Garros: Alcaraz tem tudo para vencer Djokovic no saibro",
    resumo:      "Carlos Alcaraz é o atual campeão em Roland Garros e venceu os últimos 3 encontros no saibro. Djokovic vem de lesão no joelho.",
    esporte:     "tenis",
    campeonato:  "Roland Garros",
    jogo:        "Djokovic × Alcaraz",
    autor:       "barbosa",
    dataPublicacao: "2025-06-12T09:00:00",
    tempoLeitura:   6,
    views:          2341,
    isPremium:      false,
    tip: { selecao: "Alcaraz vence", odd: 2.40, status: "pendente" },
  },
  {
    id:          "4",
    slug:        "chiefs-ravens-nfl-handicap-analise",
    titulo:      "Chiefs -3.5: Handicap superestimado para confronto equilibrado",
    resumo:      "O histórico recente indica que Baltimore cobre o spread em jogos fora de casa com frequência acima de 60%. A linha abre espaço para valor.",
    esporte:     "futebol-americano",
    campeonato:  "NFL — Week 14",
    jogo:        "Chiefs × Ravens",
    autor:       "barbosa",
    dataPublicacao: "2025-06-11T18:00:00",
    tempoLeitura:   5,
    views:          654,
    isPremium:      false,
    tip: { selecao: "Chiefs -3.5", odd: 1.95, status: "red" },
  },
  {
    id:          "5",
    slug:        "real-madrid-bayern-ambas-marcam",
    titulo:      "Real Madrid × Bayern: Ambas marcam é o mercado com maior EV",
    resumo:      "Apenas 1 dos últimos 7 confrontos diretos terminou sem as duas equipes marcando. Ataque do Bayern em boa fase, Real Madrid com linha defensiva vulnerável.",
    esporte:     "futebol",
    campeonato:  "Champions League",
    jogo:        "Real Madrid × Bayern",
    autor:       "barbosa",
    dataPublicacao: "2025-06-10T12:00:00",
    tempoLeitura:   4,
    views:          1876,
    isPremium:      false,
    tip: { selecao: "Ambas marcam — Sim", odd: 1.75, status: "pendente" },
  },
  {
    id:          "6",
    slug:        "poirier-gaethje-ufc-ko-analise",
    titulo:      "UFC 299 — Gaethje por KO: Por que a odd de 3.10 está barata",
    resumo:      "Gaethje tem 80% de finalizações por nocaute e historicamente domina o clinch contra lutadores do estilo de Poirier. Análise completa do tape.",
    esporte:     "mma",
    campeonato:  "UFC 299",
    jogo:        "Poirier × Gaethje",
    autor:       "barbosa",
    dataPublicacao: "2025-06-09T20:00:00",
    tempoLeitura:   7,
    views:          987,
    isPremium:      true,
    tip: { selecao: "Gaethje KO/TKO", odd: 3.10, status: "pendente" },
  },
  {
    id:          "7",
    slug:        "vasco-fortaleza-copa-do-brasil",
    titulo:      "Copa do Brasil: Vasco em casa vale o risco contra o Fortaleza",
    resumo:      "São Januário tem sido um fator decisivo — Vasco venceu 70% dos jogos neste estádio em 2025. Fortaleza sem dois titulares.",
    esporte:     "futebol",
    campeonato:  "Copa do Brasil",
    jogo:        "Vasco × Fortaleza",
    autor:       "barbosa",
    dataPublicacao: "2025-06-08T15:00:00",
    tempoLeitura:   3,
    views:          543,
    isPremium:      false,
    tip: undefined,
  },
  {
    id:          "8",
    slug:        "lakers-warriors-nba-analise",
    titulo:      "Lakers × Warriors: Under 220 é o melhor ângulo desta partida",
    resumo:      "Ritmo lento em jogos recentes dos dois times, com foco em execução no halfcourt. Os últimos 4 jogos diretos ficaram abaixo de 218 pontos.",
    esporte:     "basquete",
    campeonato:  "NBA",
    jogo:        "Lakers × Warriors",
    autor:       "barbosa",
    dataPublicacao: "2025-06-07T11:00:00",
    tempoLeitura:   4,
    views:          721,
    isPremium:      false,
    tip: { selecao: "Under 220 pts", odd: 1.90, status: "green" },
  },
  {
    id:          "9",
    slug:        "corinthians-botafogo-brasileirao-analise",
    titulo:      "Corinthians × Botafogo: Empate é o resultado com maior probabilidade",
    resumo:      "Média de gols nos últimos 10 confrontos é baixíssima. Corinthians priorizando defesa e Botafogo sofrendo em sequência de jogos fora.",
    esporte:     "futebol",
    campeonato:  "Brasileirão Série A",
    jogo:        "Corinthians × Botafogo",
    autor:       "barbosa",
    dataPublicacao: "2025-06-06T08:00:00",
    tempoLeitura:   5,
    views:          1102,
    isPremium:      false,
    tip: { selecao: "Empate", odd: 3.20, status: "push" },
  },
];

// Filtros tipados
export type FiltroEsporte = AnaliseSport | "todos";
export type FiltroStatus  = AnaliseStatus | "todos";

export interface AnaliseFiltros {
  esporte?:  FiltroEsporte;
  status?:   FiltroStatus;
  busca?:    string;
  page?:     number;
  perPage?:  number;
}

// Função principal — mesmo contrato que analisesService.getAll() vai ter
export function getAnalisesMock(filtros: AnaliseFiltros = {}): {
  data:    AnaliseCardData[];
  total:   number;
  hasMore: boolean;
} {
  const { esporte, status, busca, page = 1, perPage = 9 } = filtros;

  let resultado = [...ANALISES_MOCK];

  if (esporte && esporte !== "todos") {
    resultado = resultado.filter((a) => a.esporte === esporte);
  }

  if (status && status !== "todos") {
    resultado = resultado.filter((a) => a.tip?.status === status);
  }

  if (busca && busca.trim().length > 0) {
    const termo = busca.trim().toLowerCase();
    resultado = resultado.filter(
      (a) =>
        a.titulo.toLowerCase().includes(termo) ||
        a.resumo.toLowerCase().includes(termo) ||
        a.jogo.toLowerCase().includes(termo),
    );
  }

  const total   = resultado.length;
  const start   = (page - 1) * perPage;
  const data    = resultado.slice(start, start + perPage);
  const hasMore = start + perPage < total;

  return { data, total, hasMore };
}