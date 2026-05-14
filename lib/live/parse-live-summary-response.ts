import type { HomeTickerItem } from "@/lib/home/home-ticker";
import type {
  LiveActivityKind,
  LiveActivityLine,
  LivePickSlim,
  LiveSummaryPayload,
} from "@/lib/live/types";

const ACTIVITY_KINDS = new Set<LiveActivityKind>([
  "pick",
  "green",
  "red",
  "analise",
  "ativo",
]);

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function parseActivity(raw: unknown): LiveActivityLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    if (!item || typeof item !== "object") {
      return { id: `empty-${i}`, kind: "ativo" as const, text: "" };
    }
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : `act-${i}`;
    const kindRaw = o.kind;
    const kind: LiveActivityKind =
      typeof kindRaw === "string" && ACTIVITY_KINDS.has(kindRaw as LiveActivityKind)
        ? (kindRaw as LiveActivityKind)
        : "ativo";
    const text = typeof o.text === "string" ? o.text : "";
    return { id, kind, text };
  });
}

function parseTickerItems(raw: unknown): HomeTickerItem[] {
  if (!Array.isArray(raw)) return [];
  const out: HomeTickerItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : `t-${i}`;
    const headline = typeof o.headline === "string" ? o.headline : "";
    const detail = typeof o.detail === "string" ? o.detail : "";
    const tone =
      o.tone === "green" || o.tone === "red" || o.tone === "gold" || o.tone === "neutral"
        ? o.tone
        : "neutral";
    out.push({ id, headline, detail, tone });
  }
  return out;
}

/**
 * Valida/normaliza JSON da API `/api/live/summary` para evitar crash no cliente
 * quando a resposta está incompleta ou corrompida.
 */
export function parseLiveSummaryResponse(raw: unknown): LiveSummaryPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if ("error" in o && typeof o.error === "string") return null;

  const updatedAt =
    typeof o.updatedAt === "string" && o.updatedAt.length > 0
      ? o.updatedAt
      : new Date().toISOString();

  const countsRaw = o.counts;
  if (!countsRaw || typeof countsRaw !== "object" || Array.isArray(countsRaw)) {
    return {
      updatedAt,
      counts: {
        greens: 0,
        reds: 0,
        voids: 0,
        ativos: 0,
        oddMediaAtivos: null,
      },
      performance: {
        taxaAcertoPct: null,
        streakAtual: 0,
        bestGreenStreak: 0,
      },
      tickerItems: [],
      activity: [],
      recentPicks: [] as LivePickSlim[],
      trending: [] as LivePickSlim[],
    };
  }
  const c = countsRaw as Record<string, unknown>;
  const oddRaw = c.oddMediaAtivos;
  const oddMediaAtivos =
    oddRaw == null
      ? null
      : typeof oddRaw === "number" && Number.isFinite(oddRaw)
        ? oddRaw
        : null;

  const perfRaw = o.performance;
  const perf =
    perfRaw && typeof perfRaw === "object" && !Array.isArray(perfRaw)
      ? (perfRaw as Record<string, unknown>)
      : null;

  return {
    updatedAt,
    counts: {
      greens: num(c.greens, 0),
      reds: num(c.reds, 0),
      voids: num(c.voids, 0),
      ativos: num(c.ativos, 0),
      oddMediaAtivos,
    },
    performance: {
      taxaAcertoPct:
        perf && typeof perf.taxaAcertoPct === "number" && Number.isFinite(perf.taxaAcertoPct)
          ? perf.taxaAcertoPct
          : null,
      streakAtual: perf ? num(perf.streakAtual, 0) : 0,
      bestGreenStreak: perf ? num(perf.bestGreenStreak, 0) : 0,
    },
    tickerItems: parseTickerItems(o.tickerItems),
    activity: parseActivity(o.activity),
    recentPicks: [] as LivePickSlim[],
    trending: [] as LivePickSlim[],
  };
}
