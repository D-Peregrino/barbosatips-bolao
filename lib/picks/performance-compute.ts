import {
  eachDayOfInterval,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfDay,
  subDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { QuickPickRow } from "@/lib/picks/types";
import { iconeEsporte, rotuloEsporte } from "@/lib/picks/rotulo-esporte";

const TZ = "America/Sao_Paulo";
const MAX_SERIE_PONTOS = 120;
const TOP_MERCADOS = 14;
const TOP_CAMP = 10;
const ULTIMOS_N = 18;
const HOT_STREAK_MIN = 3;
const COLD_STREAK_MIN = 3;

/** Lucro em 1u por pick encerrada (regra pública do dashboard). */
export function lucroUnidadePick(p: QuickPickRow): number {
  if (p.status !== "encerrado") return 0;
  if (p.resultado === "green") return p.odd - 1;
  if (p.resultado === "red") return -1;
  if (p.resultado === "void") return 0;
  return 0;
}

export function pickTimestamp(p: QuickPickRow): number {
  if (p.resolved_at) {
    const r = Date.parse(p.resolved_at);
    if (!Number.isNaN(r) && r > 0) return r;
  }
  const h = Date.parse(p.horario_jogo);
  if (!Number.isNaN(h) && h > 0) return h;
  const c = Date.parse(p.created_at);
  return Number.isNaN(c) ? 0 : c;
}

function fmtLabelCurto(ts: number): string {
  if (!ts) return "—";
  const d = toZonedTime(new Date(ts), TZ);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: TZ,
  });
}

function weekKey(ts: number): string {
  const d = toZonedTime(new Date(ts), TZ);
  const y = getISOWeekYear(d);
  const w = getISOWeek(d);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

function weekLabelFromKey(key: string): string {
  const [y, wRaw] = key.split("-W");
  return `Sem. ${wRaw}/${y?.slice(2) ?? ""}`;
}

function dayKeyTs(ts: number): string {
  const d = startOfDay(toZonedTime(new Date(ts), TZ));
  return format(d, "yyyy-MM-dd");
}

function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const out: T[] = [];
  const step = (arr.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) {
    const idx = Math.round(i * step);
    out.push(arr[Math.min(arr.length - 1, idx)]!);
  }
  return out;
}

function roiPctGrupo(greens: number, reds: number, picks: QuickPickRow[]): number | null {
  const stake = greens + reds;
  if (stake === 0) return null;
  let lucro = 0;
  for (const p of picks) {
    lucro += lucroUnidadePick(p);
  }
  return Math.round((lucro / stake) * 1000) / 10;
}

export type BreakdownRow = {
  key: string;
  label: string;
  icon: string;
  total: number;
  greens: number;
  reds: number;
  voids: number;
  taxaPct: number | null;
  roiPct: number | null;
};

export type SemanaBar = {
  key: string;
  label: string;
  greens: number;
  reds: number;
  voids: number;
};

export type Dia30 = {
  key: string;
  label: string;
  greens: number;
  reds: number;
  voids: number;
};

export type PontoAcumulado = {
  ts: number;
  label: string;
  greensCum: number;
  redsCum: number;
};

export type PontoRoi = {
  ts: number;
  label: string;
  lucroCum: number;
  roiPorApostaPct: number;
};

export type UltimoResultado = {
  id: string;
  jogo: string;
  mercado: string;
  odd: number;
  resultado: "green" | "red" | "void";
  esporte: string;
  esporteLabel: string;
  ts: number;
};

export type PerformanceModel = {
  totalPicks: number;
  ativas: number;
  encerradas: number;
  greens: number;
  reds: number;
  voids: number;
  taxaAcertoPct: number | null;
  roiEstimadoPct: number | null;
  lucroAcumuladoUnidades: number;
  oddMedia: number | null;
  apostasComResultado: number;
  /** Maior sequência consecutiva de greens (void não quebra). */
  melhorSequenciaGreen: number;
  /** Maior sequência consecutiva de reds (void não quebra). */
  maiorSequenciaRed: number;
  /** Tipo da sequência ativa (mais recente), só green/red. */
  sequenciaAtualTipo: "green" | "red" | null;
  /** Comprimento da sequência ativa (greens ou reds seguidos desde o último resultado). */
  sequenciaAtual: number;
  hotStreak: boolean;
  coldStreak: boolean;
  porEsporte: BreakdownRow[];
  porMercado: BreakdownRow[];
  /** Campeonato como categoria editorial (quick_picks). */
  porCampeonato: BreakdownRow[];
  serieGreensReds: PontoAcumulado[];
  serieRoi: PontoRoi[];
  semanal: SemanaBar[];
  diarioTrintaDias: Dia30[];
  ultimosResultados: UltimoResultado[];
};

type Agg = { greens: number; reds: number; voids: number; picks: QuickPickRow[] };

function toBreakdownRow(
  key: string,
  label: string,
  icon: string,
  a: Agg,
): BreakdownRow {
  const { greens, reds, voids, picks } = a;
  const total = greens + reds + voids;
  const amostra = greens + reds;
  const taxaPct =
    amostra > 0 ? Math.round((greens / amostra) * 1000) / 10 : null;
  const roiPct = roiPctGrupo(greens, reds, picks);
  return { key, label, icon, total, greens, reds, voids, taxaPct, roiPct };
}

function computeStreaksFromChrono(chrono: QuickPickRow[]): {
  maxGreen: number;
  maxRed: number;
  sequenciaAtualTipo: "green" | "red" | null;
  sequenciaAtual: number;
} {
  let curG = 0;
  let curR = 0;
  let maxG = 0;
  let maxR = 0;
  for (const p of chrono) {
    if (p.resultado === "void") continue;
    if (p.resultado === "green") {
      curG += 1;
      curR = 0;
      maxG = Math.max(maxG, curG);
    } else if (p.resultado === "red") {
      curR += 1;
      curG = 0;
      maxR = Math.max(maxR, curR);
    } else {
      curG = 0;
      curR = 0;
    }
  }

  const outcomes = chrono
    .filter((p) => p.resultado === "green" || p.resultado === "red")
    .map((p) => p.resultado as "green" | "red");
  const rev = [...outcomes].reverse();
  let tipo: "green" | "red" | null = null;
  let seq = 0;
  for (const o of rev) {
    if (tipo === null) {
      tipo = o;
      seq = 1;
    } else if (o === tipo) {
      seq += 1;
    } else break;
  }

  return {
    maxGreen: maxG,
    maxRed: maxR,
    sequenciaAtualTipo: tipo,
    sequenciaAtual: seq,
  };
}

function buildUltimosResultados(encerradas: QuickPickRow[]): UltimoResultado[] {
  const settled = encerradas.filter(
    (p) => p.resultado === "green" || p.resultado === "red" || p.resultado === "void",
  );
  const sorted = [...settled].sort(
    (a, b) => pickTimestamp(b) - pickTimestamp(a),
  );
  return sorted.slice(0, ULTIMOS_N).map((p) => ({
    id: p.id,
    jogo: p.jogo,
    mercado: p.mercado,
    odd: p.odd,
    resultado: p.resultado as "green" | "red" | "void",
    esporte: (p.esporte || "futebol").trim() || "futebol",
    esporteLabel: rotuloEsporte((p.esporte || "futebol").trim() || "futebol"),
    ts: pickTimestamp(p),
  }));
}

function buildDiarioTrintaDias(encerradas: QuickPickRow[]): Dia30[] {
  const end = startOfDay(toZonedTime(new Date(), TZ));
  const start = subDays(end, 29);
  const days = eachDayOfInterval({ start, end });
  const map = new Map<string, { greens: number; reds: number; voids: number }>();
  for (const d of days) {
    map.set(format(d, "yyyy-MM-dd"), { greens: 0, reds: 0, voids: 0 });
  }
  for (const p of encerradas) {
    const ts = pickTimestamp(p);
    if (!ts) continue;
    const k = dayKeyTs(ts);
    if (!map.has(k)) continue;
    const cur = map.get(k)!;
    if (p.resultado === "green") cur.greens += 1;
    else if (p.resultado === "red") cur.reds += 1;
    else if (p.resultado === "void") cur.voids += 1;
    map.set(k, cur);
  }
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const v = map.get(key)!;
    return {
      key,
      label: format(d, "dd/MM"),
      greens: v.greens,
      reds: v.reds,
      voids: v.voids,
    };
  });
}

export function computePerformanceModel(picks: QuickPickRow[]): PerformanceModel {
  const totalPicks = picks.length;
  const ativas = picks.filter((p) => p.status === "ativo").length;
  const encerradas = picks.filter((p) => p.status === "encerrado");

  let greens = 0;
  let reds = 0;
  let voids = 0;
  for (const p of encerradas) {
    if (p.resultado === "green") greens += 1;
    else if (p.resultado === "red") reds += 1;
    else if (p.resultado === "void") voids += 1;
  }

  const apostasComResultado = greens + reds;
  const taxaAcertoPct =
    apostasComResultado > 0
      ? Math.round((greens / apostasComResultado) * 1000) / 10
      : null;

  let lucroAcumuladoUnidades = 0;
  for (const p of encerradas) {
    lucroAcumuladoUnidades += lucroUnidadePick(p);
  }
  const roiEstimadoPct =
    apostasComResultado > 0
      ? Math.round((lucroAcumuladoUnidades / apostasComResultado) * 1000) / 10
      : null;

  const settledOdd = encerradas.filter((p) => p.resultado !== "pendente");
  const oddMedia =
    settledOdd.length > 0
      ? Math.round(
          (settledOdd.reduce((s, p) => s + p.odd, 0) / settledOdd.length) * 100,
        ) / 100
      : null;

  const chrono = [...encerradas].sort(
    (a, b) => pickTimestamp(a) - pickTimestamp(b),
  );

  const { maxGreen, maxRed, sequenciaAtualTipo, sequenciaAtual } =
    computeStreaksFromChrono(chrono);

  const hotStreak =
    sequenciaAtualTipo === "green" && sequenciaAtual >= HOT_STREAK_MIN;
  const coldStreak =
    sequenciaAtualTipo === "red" && sequenciaAtual >= COLD_STREAK_MIN;

  const serieGreensRedsRaw: PontoAcumulado[] = [];
  const serieRoiRaw: PontoRoi[] = [];
  let gC = 0;
  let rC = 0;
  let runProfit = 0;
  let nBet = 0;
  for (const p of chrono) {
    const ts = pickTimestamp(p);
    if (p.resultado === "green") {
      gC += 1;
      runProfit += lucroUnidadePick(p);
      nBet += 1;
      serieGreensRedsRaw.push({
        ts,
        label: fmtLabelCurto(ts),
        greensCum: gC,
        redsCum: rC,
      });
      serieRoiRaw.push({
        ts,
        label: fmtLabelCurto(ts),
        lucroCum: Math.round(runProfit * 100) / 100,
        roiPorApostaPct:
          nBet > 0 ? Math.round((runProfit / nBet) * 1000) / 10 : 0,
      });
    } else if (p.resultado === "red") {
      rC += 1;
      runProfit += lucroUnidadePick(p);
      nBet += 1;
      serieGreensRedsRaw.push({
        ts,
        label: fmtLabelCurto(ts),
        greensCum: gC,
        redsCum: rC,
      });
      serieRoiRaw.push({
        ts,
        label: fmtLabelCurto(ts),
        lucroCum: Math.round(runProfit * 100) / 100,
        roiPorApostaPct:
          nBet > 0 ? Math.round((runProfit / nBet) * 1000) / 10 : 0,
      });
    }
  }

  const weekMap = new Map<string, { greens: number; reds: number; voids: number }>();
  for (const p of encerradas) {
    const ts = pickTimestamp(p);
    if (!ts) continue;
    const k = weekKey(ts);
    const cur = weekMap.get(k) ?? { greens: 0, reds: 0, voids: 0 };
    if (p.resultado === "green") cur.greens += 1;
    else if (p.resultado === "red") cur.reds += 1;
    else if (p.resultado === "void") cur.voids += 1;
    weekMap.set(k, cur);
  }
  const semanal: SemanaBar[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      key,
      label: weekLabelFromKey(key),
      greens: v.greens,
      reds: v.reds,
      voids: v.voids,
    }));

  const sportMap = new Map<string, Agg>();
  for (const p of encerradas) {
    const slug = (p.esporte || "futebol").trim() || "futebol";
    const agg = sportMap.get(slug) ?? {
      greens: 0,
      reds: 0,
      voids: 0,
      picks: [] as QuickPickRow[],
    };
    if (p.resultado === "green") agg.greens += 1;
    else if (p.resultado === "red") agg.reds += 1;
    else if (p.resultado === "void") agg.voids += 1;
    if (p.resultado === "green" || p.resultado === "red") agg.picks.push(p);
    sportMap.set(slug, agg);
  }
  const porEsporte = Array.from(sportMap.entries())
    .map(([slug, a]) =>
      toBreakdownRow(slug, rotuloEsporte(slug), iconeEsporte(slug), a),
    )
    .sort((x, y) => y.total - x.total);

  const mercadoMap = new Map<string, Agg>();
  for (const p of encerradas) {
    const m = (p.mercado || "—").trim() || "—";
    const agg = mercadoMap.get(m) ?? {
      greens: 0,
      reds: 0,
      voids: 0,
      picks: [] as QuickPickRow[],
    };
    if (p.resultado === "green") agg.greens += 1;
    else if (p.resultado === "red") agg.reds += 1;
    else if (p.resultado === "void") agg.voids += 1;
    if (p.resultado === "green" || p.resultado === "red") agg.picks.push(p);
    mercadoMap.set(m, agg);
  }
  const mercadosSorted = Array.from(mercadoMap.entries()).sort(
    (a, b) => b[1].greens + b[1].reds + b[1].voids - (a[1].greens + a[1].reds + a[1].voids),
  );
  const topM = mercadosSorted.slice(0, TOP_MERCADOS);
  const restM = mercadosSorted.slice(TOP_MERCADOS);
  const porMercado: BreakdownRow[] = topM.map(([key, a]) =>
    toBreakdownRow(
      key,
      key.length > 56 ? `${key.slice(0, 54)}…` : key,
      "📊",
      a,
    ),
  );
  if (restM.length > 0) {
    const outros: Agg = restM.reduce(
      (acc, [, a]) => ({
        greens: acc.greens + a.greens,
        reds: acc.reds + a.reds,
        voids: acc.voids + a.voids,
        picks: [...acc.picks, ...a.picks],
      }),
      { greens: 0, reds: 0, voids: 0, picks: [] as QuickPickRow[] },
    );
    porMercado.push(
      toBreakdownRow("outros", "Outros mercados", "➕", outros),
    );
  }

  const campMap = new Map<string, Agg>();
  for (const p of encerradas) {
    const c = (p.campeonato || "—").trim() || "—";
    const agg = campMap.get(c) ?? {
      greens: 0,
      reds: 0,
      voids: 0,
      picks: [] as QuickPickRow[],
    };
    if (p.resultado === "green") agg.greens += 1;
    else if (p.resultado === "red") agg.reds += 1;
    else if (p.resultado === "void") agg.voids += 1;
    if (p.resultado === "green" || p.resultado === "red") agg.picks.push(p);
    campMap.set(c, agg);
  }
  const campsSorted = Array.from(campMap.entries()).sort(
    (a, b) => b[1].greens + b[1].reds + b[1].voids - (a[1].greens + a[1].reds + a[1].voids),
  );
  const topC = campsSorted.slice(0, TOP_CAMP);
  const restC = campsSorted.slice(TOP_CAMP);
  const porCampeonato: BreakdownRow[] = topC.map(([key, a]) =>
    toBreakdownRow(
      key,
      key.length > 48 ? `${key.slice(0, 46)}…` : key,
      "🏆",
      a,
    ),
  );
  if (restC.length > 0) {
    const outrosC: Agg = restC.reduce(
      (acc, [, a]) => ({
        greens: acc.greens + a.greens,
        reds: acc.reds + a.reds,
        voids: acc.voids + a.voids,
        picks: [...acc.picks, ...a.picks],
      }),
      { greens: 0, reds: 0, voids: 0, picks: [] as QuickPickRow[] },
    );
    porCampeonato.push(
      toBreakdownRow("outros-cat", "Outras competições", "➕", outrosC),
    );
  }

  const ultimosResultados = buildUltimosResultados(encerradas);
  const diarioTrintaDias = buildDiarioTrintaDias(encerradas);

  return {
    totalPicks,
    ativas,
    encerradas: encerradas.length,
    greens,
    reds,
    voids,
    taxaAcertoPct,
    roiEstimadoPct,
    lucroAcumuladoUnidades: Math.round(lucroAcumuladoUnidades * 100) / 100,
    oddMedia,
    apostasComResultado,
    melhorSequenciaGreen: maxGreen,
    maiorSequenciaRed: maxRed,
    sequenciaAtualTipo,
    sequenciaAtual,
    hotStreak,
    coldStreak,
    porEsporte,
    porMercado,
    porCampeonato,
    serieGreensReds: downsample(serieGreensRedsRaw, MAX_SERIE_PONTOS),
    serieRoi: downsample(serieRoiRaw, MAX_SERIE_PONTOS),
    semanal,
    diarioTrintaDias,
    ultimosResultados,
  };
}
