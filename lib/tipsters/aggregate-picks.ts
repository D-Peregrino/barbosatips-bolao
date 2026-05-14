import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QuickPickRow } from "@/lib/picks/types";

function tMs(iso: string): number {
  const n = new Date(iso).getTime();
  return Number.isFinite(n) ? n : 0;
}

export type RoiSeriesPoint = {
  /** ms epoch */
  t: number;
  label: string;
  cumulativeUnits: number;
};

/** Série cumulativa de unidades (stake 1u) ao longo do tempo — picks encerradas ordenadas. */
export function buildCumulativeUnitsSeries(picks: QuickPickRow[]): RoiSeriesPoint[] {
  const closed = picks
    .filter((p) => p.status === "encerrado")
    .filter((p) => p.resultado === "green" || p.resultado === "red" || p.resultado === "void")
    .sort((a, b) => tMs(a.horario_jogo) - tMs(b.horario_jogo));

  let u = 0;
  const out: RoiSeriesPoint[] = [];
  for (const p of closed) {
    if (p.resultado === "green") u += p.odd > 0 ? p.odd - 1 : 0;
    else if (p.resultado === "red") u -= 1;
    const raw = p.horario_jogo?.trim();
    let label = "—";
    try {
      if (raw) {
        const d = new Date(raw);
        if (!Number.isNaN(d.getTime())) label = format(d, "dd MMM yy", { locale: ptBR });
      }
    } catch {
      label = "—";
    }
    out.push({ t: tMs(p.horario_jogo), label, cumulativeUnits: Math.round(u * 100) / 100 });
  }
  return out;
}

export type MonthPerformance = {
  key: string;
  label: string;
  greens: number;
  reds: number;
  voids: number;
  units: number;
};

/** Agrega picks encerradas por mês civil (timezone local da formatação). */
export function aggregateMonthlyPerformance(picks: QuickPickRow[]): MonthPerformance[] {
  const map = new Map<string, MonthPerformance>();

  for (const p of picks) {
    if (p.status !== "encerrado") continue;
    if (p.resultado !== "green" && p.resultado !== "red" && p.resultado !== "void") continue;
    const raw = p.horario_jogo?.trim();
    if (!raw) continue;
    let key: string;
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      key = format(d, "yyyy-MM");
    } catch {
      continue;
    }
    const cur =
      map.get(key) ??
      ({
        key,
        label: "",
        greens: 0,
        reds: 0,
        voids: 0,
        units: 0,
      } as MonthPerformance);
    if (!cur.label) {
      try {
        const d0 = new Date(`${key}-01T12:00:00`);
        cur.label = Number.isNaN(d0.getTime()) ? key : format(d0, "MMM yyyy", { locale: ptBR });
      } catch {
        cur.label = key;
      }
    }
    if (p.resultado === "green") {
      cur.greens += 1;
      cur.units += p.odd > 0 ? p.odd - 1 : 0;
    } else if (p.resultado === "red") {
      cur.reds += 1;
      cur.units -= 1;
    } else cur.voids += 1;
    map.set(key, cur);
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export type MarketAgg = {
  mercado: string;
  greens: number;
  reds: number;
  units: number;
  taxa: number | null;
};

export function aggregateByMercado(picks: QuickPickRow[], minSample = 2): MarketAgg[] {
  const m = new Map<string, { greens: number; reds: number; units: number }>();
  for (const p of picks) {
    if (p.status !== "encerrado") continue;
    if (p.resultado !== "green" && p.resultado !== "red") continue;
    const key = p.mercado?.trim() || "—";
    const cur = m.get(key) ?? { greens: 0, reds: 0, units: 0 };
    if (p.resultado === "green") {
      cur.greens += 1;
      cur.units += p.odd > 0 ? p.odd - 1 : 0;
    } else {
      cur.reds += 1;
      cur.units -= 1;
    }
    m.set(key, cur);
  }
  const rows: MarketAgg[] = Array.from(m.entries()).map(([mercado, v]) => {
    const n = v.greens + v.reds;
    return {
      mercado,
      greens: v.greens,
      reds: v.reds,
      units: Math.round(v.units * 100) / 100,
      taxa: n > 0 ? Math.round((v.greens / n) * 1000) / 10 : null,
    };
  });
  return rows
    .filter((r) => r.greens + r.reds >= minSample)
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);
}

export type SportAgg = {
  esporte: string;
  label: string;
  greens: number;
  reds: number;
  units: number;
  taxa: number | null;
};

/** Rótulo de esporte a partir do slug (ex.: `rotuloEsporte`). */
// eslint-disable-next-line no-unused-vars -- parâmetro só documenta o contrato do callback
export type EsporteLabelFn = (esporteSlug: string) => string;

export function aggregateByEsporte(
  picks: QuickPickRow[],
  labelFn: EsporteLabelFn,
  minSample = 2,
): SportAgg[] {
  const m = new Map<string, { greens: number; reds: number; units: number }>();
  for (const p of picks) {
    if (p.status !== "encerrado") continue;
    if (p.resultado !== "green" && p.resultado !== "red") continue;
    const slug = p.esporte?.trim() || "futebol";
    const cur = m.get(slug) ?? { greens: 0, reds: 0, units: 0 };
    if (p.resultado === "green") {
      cur.greens += 1;
      cur.units += p.odd > 0 ? p.odd - 1 : 0;
    } else {
      cur.reds += 1;
      cur.units -= 1;
    }
    m.set(slug, cur);
  }
  const rows: SportAgg[] = Array.from(m.entries()).map(([esporte, v]) => {
    const n = v.greens + v.reds;
    return {
      esporte,
      label: labelFn(esporte),
      greens: v.greens,
      reds: v.reds,
      units: Math.round(v.units * 100) / 100,
      taxa: n > 0 ? Math.round((v.greens / n) * 1000) / 10 : null,
    };
  });
  return rows
    .filter((r) => r.greens + r.reds >= minSample)
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);
}

/** Últimas picks encerradas ou ativas para histórico compacto. */
export function recentPicksHistory(picks: QuickPickRow[], limit: number): QuickPickRow[] {
  return [...picks]
    .sort((a, b) => tMs(b.horario_jogo) - tMs(a.horario_jogo))
    .slice(0, limit);
}
