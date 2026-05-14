import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { relativeTimeAgoPt } from "@/lib/live/time-ago";

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
    headline: "AO VIVO",
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

function shortTitulo(a: AnaliseRow, max = 44): string {
  const t = a.titulo.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function shortJogo(p: QuickPickRow, max = 40): string {
  const j = p.jogo.trim();
  if (j.length <= max) return j;
  return `${j.slice(0, max - 1)}…`;
}

/** Itens para o ticker da home: picks + análises reais + preenchimento editorial. */
export function buildHomeTickerItems(
  picks: QuickPickRow[],
  analises: AnaliseRow[] = [],
  now = Date.now(),
): HomeTickerItem[] {
  const fromPicks: HomeTickerItem[] = picks.map((p) => ({
    id: `pick-${p.id}`,
    tone: toneFromPick(p),
    headline: `PICK · ${shortJogo(p)}`,
    detail: `${p.mercado} · @ ${Number(p.odd).toFixed(2)} · ${relativeTimeAgoPt(p.created_at, now)}`,
  }));

  const fromAnalises: HomeTickerItem[] = analises.map((a) => ({
    id: `anal-${a.id}`,
    tone: "gold" as const,
    headline: `ANÁLISE · ${shortTitulo(a)}`,
    detail: `${relativeTimeAgoPt(a.created_at, now)} · conf. ${a.confianca}%`,
  }));

  const merged = [...fromPicks, ...fromAnalises, ...FALLBACK];
  const seen = new Set<string>();
  const dedup: HomeTickerItem[] = [];
  for (const item of merged) {
    const key = `${item.headline}|${item.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(item);
    if (dedup.length >= 26) break;
  }
  return dedup.length >= 8 ? dedup : [...dedup, ...FALLBACK].slice(0, 18);
}
