import type { QuickPickRow } from "@/lib/picks/types";

export type HomeTickerTone = "green" | "red" | "gold" | "neutral";

export type HomeTickerItem = {
  id: string;
  tone: HomeTickerTone;
  headline: string;
  detail: string;
};

const FALLBACK: HomeTickerItem[] = [
  {
    id: "fb-1",
    tone: "green",
    headline: "GREEN · Brasileirão",
    detail: "Flamengo ML @ 1.95",
  },
  {
    id: "fb-2",
    tone: "neutral",
    headline: "Ao vivo",
    detail: "City × Arsenal · Over 2.5 @ 1.88",
  },
  {
    id: "fb-3",
    tone: "red",
    headline: "RED · NBA",
    detail: "Spread -4.5 @ 1.91",
  },
  {
    id: "fb-4",
    tone: "gold",
    headline: "Odd em destaque",
    detail: "BTTS Sim @ 2.05 · Conference League",
  },
  {
    id: "fb-5",
    tone: "green",
    headline: "GREEN · Série B",
    detail: "Dupla chance 1X @ 1.42",
  },
  {
    id: "fb-6",
    tone: "neutral",
    headline: "Próximo apito",
    detail: "Libertadores · 21:30 BRT",
  },
];

function toneFromPick(p: QuickPickRow): HomeTickerTone {
  if (p.status === "ativo") return "gold";
  if (p.resultado === "green") return "green";
  if (p.resultado === "red") return "red";
  return "neutral";
}

/** Itens para o ticker da home: picks reais + preenchimento editorial (sem alterar dados). */
export function buildHomeTickerItems(picks: QuickPickRow[]): HomeTickerItem[] {
  const fromPicks: HomeTickerItem[] = picks.map((p) => ({
    id: `pick-${p.id}`,
    tone: toneFromPick(p),
    headline: p.jogo,
    detail: `${p.mercado} · @ ${Number(p.odd).toFixed(2)}`,
  }));

  const merged = [...fromPicks, ...FALLBACK];
  const seen = new Set<string>();
  const dedup: HomeTickerItem[] = [];
  for (const item of merged) {
    const key = `${item.headline}|${item.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(item);
    if (dedup.length >= 22) break;
  }
  return dedup.length >= 8 ? dedup : [...dedup, ...FALLBACK].slice(0, 16);
}
