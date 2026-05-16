import { startOfDay, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  computePerformanceModel,
  lucroUnidadePick,
  pickTimestamp,
  type PerformanceModel,
} from "@/lib/picks/performance-compute";
import type { QuickPickRow } from "@/lib/picks/types";

const TZ = "America/Sao_Paulo";

export const PERFORMANCE_PERIODS = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "geral", label: "Geral" },
] as const;

export type PerformancePeriodId = (typeof PERFORMANCE_PERIODS)[number]["id"];

export function isPerformancePeriodId(v: string): v is PerformancePeriodId {
  return PERFORMANCE_PERIODS.some((p) => p.id === v);
}

export function parsePerformancePeriod(raw: string | undefined): PerformancePeriodId {
  const s = String(raw ?? "").trim().toLowerCase();
  return isPerformancePeriodId(s) ? s : "30d";
}

/** Picks encerradas com resultado definitivo (pendentes e ativas ficam de fora das métricas). */
export function pickEncerradaComResultado(p: QuickPickRow): boolean {
  if (p.status !== "encerrado") return false;
  return p.resultado === "green" || p.resultado === "red" || p.resultado === "void";
}

function startOfTodayTz(): Date {
  return startOfDay(toZonedTime(new Date(), TZ));
}

/** Filtra picks pelo instante do jogo (horario_jogo ou created_at) no fuso BR. */
export function filterPicksByPeriod(
  picks: QuickPickRow[],
  period: PerformancePeriodId,
): QuickPickRow[] {
  if (period === "geral") return picks;

  const now = toZonedTime(new Date(), TZ);
  const todayStart = startOfTodayTz().getTime();

  let fromMs = 0;
  if (period === "hoje") {
    fromMs = todayStart;
  } else if (period === "7d") {
    fromMs = subDays(startOfDay(now), 6).getTime();
  } else if (period === "30d") {
    fromMs = subDays(startOfDay(now), 29).getTime();
  }

  return picks.filter((p) => {
    const ts = pickTimestamp(p);
    return ts >= fromMs;
  });
}

export type PerformancePeriodStats = {
  period: PerformancePeriodId;
  label: string;
  /** Greens + reds + voids no período (sem pendentes/ativas). */
  totalResolvidas: number;
  greens: number;
  reds: number;
  voids: number;
  winratePct: number | null;
  roiPct: number | null;
  lucroUnidades: number;
  streakAtual: number;
  streakAtualTipo: "green" | "red" | null;
  /** Maior sequência de greens (void não interrompe). */
  streakMaximaGreen: number;
  ativasNoPeriodo: number;
};

function computeStreaksForPeriod(encerradasComResultado: QuickPickRow[]): {
  streakAtual: number;
  streakAtualTipo: "green" | "red" | null;
  streakMaximaGreen: number;
} {
  const chrono = [...encerradasComResultado].sort(
    (a, b) => pickTimestamp(a) - pickTimestamp(b),
  );

  let curG = 0;
  let maxG = 0;
  for (const p of chrono) {
    if (p.resultado === "void") continue;
    if (p.resultado === "green") {
      curG += 1;
      maxG = Math.max(maxG, curG);
    } else if (p.resultado === "red") {
      curG = 0;
    } else {
      curG = 0;
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

  let streakAtual = 0;
  if (tipo === "green") streakAtual = seq;
  else if (tipo === "red") streakAtual = -seq;

  return { streakAtual, streakAtualTipo: tipo, streakMaximaGreen: maxG };
}

export function computePerformancePeriodStats(
  picks: QuickPickRow[],
  period: PerformancePeriodId,
): PerformancePeriodStats {
  const label =
    PERFORMANCE_PERIODS.find((p) => p.id === period)?.label ?? period;

  const noPeriodo = filterPicksByPeriod(picks, period);
  const encerradas = noPeriodo.filter((p) => p.status === "encerrado");
  const resolvidas = encerradas.filter(pickEncerradaComResultado);

  let greens = 0;
  let reds = 0;
  let voids = 0;
  let lucro = 0;

  for (const p of resolvidas) {
    if (p.resultado === "green") greens += 1;
    else if (p.resultado === "red") reds += 1;
    else if (p.resultado === "void") voids += 1;
    lucro += lucroUnidadePick(p);
  }

  const amostra = greens + reds;
  const winratePct =
    amostra > 0 ? Math.round((greens / amostra) * 1000) / 10 : null;
  const roiPct =
    amostra > 0 ? Math.round((lucro / amostra) * 1000) / 10 : null;

  const { streakAtual, streakAtualTipo, streakMaximaGreen } =
    computeStreaksForPeriod(resolvidas);

  const ativasNoPeriodo = noPeriodo.filter((p) => p.status === "ativo").length;

  return {
    period,
    label,
    totalResolvidas: greens + reds + voids,
    greens,
    reds,
    voids,
    winratePct,
    roiPct,
    lucroUnidades: Math.round(lucro * 100) / 100,
    streakAtual,
    streakAtualTipo,
    streakMaximaGreen,
    ativasNoPeriodo,
  };
}

export function buildAllPerformancePeriodStats(
  picks: QuickPickRow[],
): PerformancePeriodStats[] {
  return PERFORMANCE_PERIODS.map((p) =>
    computePerformancePeriodStats(picks, p.id),
  );
}

/** Modelo completo (gráficos, breakdowns) para o período seleccionado. */
export function computePerformanceModelForPeriod(
  picks: QuickPickRow[],
  period: PerformancePeriodId,
): PerformanceModel {
  const filtered = filterPicksByPeriod(picks, period);
  return computePerformanceModel(filtered);
}
