import { format, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { AnaliseRow } from "@/lib/analises/types";
import type { LeadRow } from "@/lib/leads/types";
import { computePerformanceModel, lucroUnidadePick, pickTimestamp } from "@/lib/picks/performance-compute";
import type { QuickPickRow } from "@/lib/picks/types";
import { inRangeMs } from "@/lib/analytics/date-range";

const TZ = "America/Sao_Paulo";

export type LeadSourceCount = { source: string; count: number };

export type LeadDayPoint = { key: string; label: string; count: number };

export type MercadoLucroRow = {
  mercado: string;
  lucroU: number;
  greens: number;
  reds: number;
};

export type HourPerformanceRow = {
  hora: number;
  label: string;
  lucroU: number;
  apostas: number;
};

export type PickProxyRow = {
  id: string;
  jogo: string;
  mercado: string;
  confianca: number;
  score: number;
  href: string;
};

export type AnaliseProxyRow = {
  slug: string;
  titulo: string;
  confianca: number;
  campeonato: string;
  score: number;
  href: string;
};

function filterPicks(picks: QuickPickRow[], fromMs: number, toMs: number): QuickPickRow[] {
  return picks.filter((p) => inRangeMs(pickTimestamp(p), fromMs, toMs));
}

function filterLeads(leads: LeadRow[], fromMs: number, toMs: number): LeadRow[] {
  return leads.filter((l) => {
    const t = Date.parse(l.created_at);
    return Number.isFinite(t) && inRangeMs(t, fromMs, toMs);
  });
}

export function buildLeadsBySource(leads: LeadRow[], fromMs: number, toMs: number): LeadSourceCount[] {
  const map = new Map<string, number>();
  for (const l of filterLeads(leads, fromMs, toMs)) {
    const s = (l.source || "—").trim() || "—";
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildLeadsDaily(leads: LeadRow[], fromMs: number, toMs: number): LeadDayPoint[] {
  const map = new Map<string, number>();
  for (const l of filterLeads(leads, fromMs, toMs)) {
    const t = Date.parse(l.created_at);
    if (!Number.isFinite(t)) continue;
    const d = toZonedTime(new Date(t), TZ);
    const key = format(startOfDay(d), "yyyy-MM-dd");
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      key,
      label: format(new Date(`${key}T12:00:00`), "dd/MM"),
      count,
    }));
}

export function buildMercadosLucrativos(
  picks: QuickPickRow[],
  fromMs: number,
  toMs: number,
  limit = 12,
): MercadoLucroRow[] {
  const map = new Map<string, { lucroU: number; greens: number; reds: number }>();
  for (const p of filterPicks(picks, fromMs, toMs)) {
    if (p.status !== "encerrado") continue;
    if (p.resultado !== "green" && p.resultado !== "red") continue;
    const m = (p.mercado || "—").trim() || "—";
    const cur = map.get(m) ?? { lucroU: 0, greens: 0, reds: 0 };
    cur.lucroU += lucroUnidadePick(p);
    if (p.resultado === "green") cur.greens += 1;
    else cur.reds += 1;
    map.set(m, cur);
  }
  return Array.from(map.entries())
    .map(([mercado, v]) => ({ mercado, ...v }))
    .sort((a, b) => b.lucroU - a.lucroU)
    .slice(0, limit);
}

export function buildHorariosPerformance(
  picks: QuickPickRow[],
  fromMs: number,
  toMs: number,
): HourPerformanceRow[] {
  const acc = new Map<number, { lucroU: number; apostas: number }>();
  for (let h = 0; h < 24; h++) acc.set(h, { lucroU: 0, apostas: 0 });

  for (const p of filterPicks(picks, fromMs, toMs)) {
    if (p.status !== "encerrado") continue;
    if (p.resultado !== "green" && p.resultado !== "red") continue;
    const ts = pickTimestamp(p);
    const d = toZonedTime(new Date(ts), TZ);
    const h = d.getHours();
    const cur = acc.get(h)!;
    cur.lucroU += lucroUnidadePick(p);
    cur.apostas += 1;
    acc.set(h, cur);
  }

  return Array.from(acc.entries())
    .map(([hora, v]) => ({
      hora,
      label: `${String(hora).padStart(2, "0")}h`,
      lucroU: Math.round(v.lucroU * 100) / 100,
      apostas: v.apostas,
    }))
    .sort((a, b) => a.hora - b.hora);
}

export function buildPicksClickProxy(
  picks: QuickPickRow[],
  fromMs: number,
  toMs: number,
  limit = 10,
): PickProxyRow[] {
  const rows = filterPicks(picks, fromMs, toMs)
    .filter((p) => p.status === "ativo" || p.status === "encerrado")
    .map((p) => {
      const ts = pickTimestamp(p);
      const recency = Math.max(0, 1 - (Date.now() - ts) / (90 * 86400000));
      const score = p.confianca * 0.65 + recency * 35;
      return {
        id: p.id,
        jogo: p.jogo,
        mercado: p.mercado,
        confianca: p.confianca,
        score,
        href: `/pick/${encodeURIComponent(p.id)}`,
      };
    });
  return [...rows].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function buildAnalisesHeatProxy(analises: AnaliseRow[], limit = 10): AnaliseProxyRow[] {
  const rows = analises.map((a) => {
    const t = Date.parse(a.created_at);
    const recency = Number.isFinite(t)
      ? Math.max(0, 1 - (Date.now() - t) / (120 * 86400000))
      : 0;
    const score = a.confianca * 0.55 + recency * 45;
    return {
      slug: a.slug,
      titulo: a.titulo,
      confianca: a.confianca,
      campeonato: a.campeonato,
      score,
      href: `/analise/${encodeURIComponent(a.slug)}`,
    };
  });
  return [...rows].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function buildEsportePerformanceRows(picks: QuickPickRow[], fromMs: number, toMs: number) {
  const filtered = filterPicks(picks, fromMs, toMs);
  return computePerformanceModel(filtered).porEsporte;
}

export function maxBarValue(values: number[]): number {
  const m = Math.max(0, ...values, 1);
  return m;
}

export function formatSourceLabel(source: string): string {
  const map: Record<string, string> = {
    popup: "Popup",
    sticky: "Sticky",
    inline_analises: "Inline análises",
    inline_picks: "Inline picks",
    newsletter: "Newsletter",
    comunidade: "Comunidade",
  };
  return map[source] ?? source;
}
