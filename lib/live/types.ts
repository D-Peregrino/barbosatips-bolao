import type { HomeTickerItem } from "@/lib/home/home-ticker";

export type LiveActivityKind = "pick" | "green" | "red" | "analise" | "ativo";

export type LiveActivityLine = {
  id: string;
  kind: LiveActivityKind;
  text: string;
};

export type LivePickSlim = {
  id: string;
  jogo: string;
  mercado: string;
  odd: number;
  status: "ativo" | "encerrado";
  resultado: string;
  is_premium: boolean;
  confianca: number;
  esporte: string;
  badges: Array<"HOT" | "PREMIUM">;
};

export type LiveSummaryPayload = {
  updatedAt: string;
  counts: {
    greens: number;
    reds: number;
    voids: number;
    ativos: number;
    oddMediaAtivos: number | null;
  };
  performance: {
    taxaAcertoPct: number | null;
    streakAtual: number;
    bestGreenStreak: number;
  };
  tickerItems: HomeTickerItem[];
  activity: LiveActivityLine[];
  recentPicks: LivePickSlim[];
  trending: LivePickSlim[];
};
