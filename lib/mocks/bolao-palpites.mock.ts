// lib/mocks/bolao-palpites.mock.ts
// Jogos do bolão para tela de palpites (mock até integrar Supabase).

export interface BolaoJogoPalpiteMock {
  id: string;
  mandante: string;
  visitante: string;
  competicao: string;
  /** ISO 8601 — só para exibição */
  dataISO: string;
}

export const BOLAO_JOGOS_PALPITES_MOCK: BolaoJogoPalpiteMock[] = [
  {
    id: "j1",
    mandante: "Flamengo",
    visitante: "Palmeiras",
    competicao: "Brasileirão — Rodada 12",
    dataISO: "2026-05-18T21:30:00",
  },
  {
    id: "j2",
    mandante: "Celtics",
    visitante: "Knicks",
    competicao: "NBA Playoffs",
    dataISO: "2026-05-19T20:00:00",
  },
  {
    id: "j3",
    mandante: "Real Madrid",
    visitante: "Bayern",
    competicao: "Champions League",
    dataISO: "2026-05-20T15:00:00",
  },
  {
    id: "j4",
    mandante: "Corinthians",
    visitante: "São Paulo",
    competicao: "Paulistão — Final",
    dataISO: "2026-05-21T16:00:00",
  },
  {
    id: "j5",
    mandante: "Chiefs",
    visitante: "Ravens",
    competicao: "NFL — Semana 1",
    dataISO: "2026-05-22T19:00:00",
  },
];

/** Chave única no localStorage para palpites do bolão (versão do schema). */
export const BOLAO_PALPITES_STORAGE_KEY = "barbosatips:bolao:palpites:v1";

export type PalpitesSalvosMap = Record<string, { casa: string; fora: string }>;
