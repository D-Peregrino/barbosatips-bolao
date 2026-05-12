// lib/mocks/tips.mock.ts
// Fonte única de dados de tips enquanto o Supabase não está conectado.
// Quando o backend estiver pronto, delete este arquivo e reconecte os services.

import type { TipCardData, TipSport } from "@/components/tips/TipCard";

export const TIPS_MOCK: TipCardData[] = [
  {
    id:          "1",
    esporte:     "futebol",
    campeonato:  "Brasileirão Série A",
    jogo:        "Flamengo × Palmeiras",
    mercado:     "Resultado Final",
    selecao:     "Flamengo vence",
    odd:         2.15,
    confianca:   5,
    horario:     "2025-06-20T21:00:00",
    status:      "pending",
    ev:          8.2,
    analiseSlug: "flamengo-x-palmeiras-rodada-12",
  },
  {
    id:          "2",
    esporte:     "basquete",
    campeonato:  "NBA Playoffs",
    jogo:        "Celtics × Knicks",
    mercado:     "Total de Pontos",
    selecao:     "Over 214.5",
    odd:         1.87,
    confianca:   3,
    horario:     "2025-06-20T20:30:00",
    status:      "win",
    ev:          5.4,
    analiseSlug: null,
  },
  {
    id:          "3",
    esporte:     "futebol-americano",
    campeonato:  "NFL — Week 14",
    jogo:        "Chiefs × Ravens",
    mercado:     "Handicap",
    selecao:     "Chiefs -3.5",
    odd:         1.95,
    confianca:   2,
    horario:     "2025-06-20T18:25:00",
    status:      "loss",
    ev:          null,
    analiseSlug: null,
  },
  {
    id:          "4",
    esporte:     "tenis",
    campeonato:  "Roland Garros",
    jogo:        "Djokovic × Alcaraz",
    mercado:     "Vencedor da Partida",
    selecao:     "Alcaraz vence",
    odd:         2.40,
    confianca:   4,
    horario:     "2025-06-20T15:00:00",
    status:      "pending",
    ev:          11.3,
    analiseSlug: "djokovic-alcaraz-roland-garros",
  },
  {
    id:          "5",
    esporte:     "futebol",
    campeonato:  "Champions League",
    jogo:        "Real Madrid × Bayern",
    mercado:     "Ambas Marcam",
    selecao:     "Sim",
    odd:         1.75,
    confianca:   3,
    horario:     "2025-06-21T21:00:00",
    status:      "pending",
    ev:          4.1,
    analiseSlug: null,
  },
  {
    id:          "6",
    esporte:     "mma",
    campeonato:  "UFC 299",
    jogo:        "Poirier × Gaethje",
    mercado:     "Método de Vitória",
    selecao:     "Gaethje KO/TKO",
    odd:         3.10,
    confianca:   2,
    horario:     "2025-06-21T02:00:00",
    status:      "pending",
    ev:          6.8,
    analiseSlug: null,
  },
];

// Retorna só as tips de hoje — mesmo contrato de tipsService.getTipsOfTheDay()
export function getTipsMockHoje(): TipCardData[] {
  return TIPS_MOCK.filter((t) => t.status === "pending");
}

// Retorna todas paginadas — mesmo contrato de tipsService.getAll()
export function getTipsMockAll(page = 1, perPage = 12): {
  data:    TipCardData[];
  total:   number;
  hasMore: boolean;
} {
  const start = (page - 1) * perPage;
  const slice = TIPS_MOCK.slice(start, start + perPage);
  return {
    data:    slice,
    total:   TIPS_MOCK.length,
    hasMore: start + perPage < TIPS_MOCK.length,
  };
}
