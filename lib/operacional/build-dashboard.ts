import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { lucroUnidadePick, pickTimestamp } from "@/lib/picks/performance-compute";
import { parseHorarioJogoBrasilia } from "@/lib/picks/parse-horario";

const TZ = "America/Sao_Paulo";

export type OperacionalAgendaItem = {
  id: string;
  tipo: "importante" | "live" | "futuro";
  titulo: string;
  subtitulo: string;
  horarioLabel: string;
  href: string;
};

export type OperacionalProducao = {
  analisesRascunho: number;
  analisesPublicadasHoje: number;
  picksAtivasFuturas: number;
  ultimosRascunhos: { slug: string; titulo: string; href: string }[];
};

export type OperacionalPerformancePlaceholder = {
  label: string;
  hint: string;
};

export type OperacionalLeadsResumo = {
  total: number;
  hoje: number;
  ultimos7Dias: number;
};

export type OperacionalResumoDia = {
  picksPublicadasHoje: number;
  analisesPublicadasHoje: number;
  greensHoje: number;
  redsHoje: number;
  voidsHoje: number;
  roiDiarioUnidades: number | null;
  picksEncerradasComResultadoHoje: number;
};

function calendarDayKeySp(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

function isIsoOnSameZonedDay(iso: string, ref: Date = new Date()): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return calendarDayKeySp(d) === calendarDayKeySp(ref);
}

/** Data do jogo (horário de Brasília) cai no dia civil de `ref` em SP. */
function pickGameDayInSp(p: QuickPickRow, ref: Date = new Date()): boolean {
  const raw = p.horario_jogo?.trim();
  if (!raw) return isIsoOnSameZonedDay(p.created_at, ref);
  const game = parseHorarioJogoBrasilia(raw);
  if (Number.isNaN(game.getTime())) return isIsoOnSameZonedDay(p.created_at, ref);
  return calendarDayKeySp(game) === calendarDayKeySp(ref);
}

export function buildResumoDia(
  picks: QuickPickRow[],
  analisesPublicadas: AnaliseRow[],
  ref: Date = new Date(),
): OperacionalResumoDia {
  const picksPublicadasHoje = picks.filter((p) => isIsoOnSameZonedDay(p.created_at, ref)).length;
  const analisesPublicadasHoje = analisesPublicadas.filter(
    (a) => isIsoOnSameZonedDay(a.created_at, ref),
  ).length;

  const encerradasHojeJogo = picks.filter(
    (p) => p.status === "encerrado" && pickGameDayInSp(p, ref),
  );

  let greensHoje = 0;
  let redsHoje = 0;
  let voidsHoje = 0;
  let lucro = 0;
  let stake = 0;

  for (const p of encerradasHojeJogo) {
    if (p.resultado === "green") greensHoje += 1;
    else if (p.resultado === "red") redsHoje += 1;
    else if (p.resultado === "void") voidsHoje += 1;
    if (p.resultado === "green" || p.resultado === "red") {
      stake += 1;
      lucro += lucroUnidadePick(p);
    }
  }

  return {
    picksPublicadasHoje,
    analisesPublicadasHoje,
    greensHoje,
    redsHoje,
    voidsHoje,
    roiDiarioUnidades: stake > 0 ? Math.round(lucro * 100) / 100 : null,
    picksEncerradasComResultadoHoje: encerradasHojeJogo.filter(
      (p) => p.resultado === "green" || p.resultado === "red" || p.resultado === "void",
    ).length,
  };
}

function formatHorarioPick(p: QuickPickRow): string {
  const raw = p.horario_jogo?.trim();
  if (!raw) return "—";
  const d = parseHorarioJogoBrasilia(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LIVE_WINDOW_MS = 2.75 * 60 * 60 * 1000;

export function buildAgenda(picks: QuickPickRow[], ref: Date = new Date()): OperacionalAgendaItem[] {
  const now = ref.getTime();
  const ativos = picks.filter((p) => p.status === "ativo");

  const importantes: OperacionalAgendaItem[] = [];
  const lives: OperacionalAgendaItem[] = [];
  const futuros: OperacionalAgendaItem[] = [];

  for (const p of ativos) {
    const game = p.horario_jogo?.trim()
      ? parseHorarioJogoBrasilia(p.horario_jogo)
      : new Date(NaN);
    const gameTs = Number.isNaN(game.getTime()) ? pickTimestamp(p) : game.getTime();

    const item: OperacionalAgendaItem = {
      id: p.id,
      tipo: "futuro",
      titulo: p.jogo || "Confronto",
      subtitulo: `${p.campeonato || "—"} · ${p.mercado}`,
      horarioLabel: formatHorarioPick(p),
      href: `/pick/${encodeURIComponent(p.id)}`,
    };

    if (pickGameDayInSp(p, ref)) {
      importantes.push({ ...item, tipo: "importante" });
    }

    if (
      !Number.isNaN(gameTs) &&
      gameTs <= now &&
      now <= gameTs + LIVE_WINDOW_MS
    ) {
      lives.push({ ...item, tipo: "live" });
    } else if (!Number.isNaN(gameTs) && gameTs > now) {
      futuros.push({ ...item, tipo: "futuro" });
    }
  }

  const sortByTs = (arr: OperacionalAgendaItem[]) =>
    arr.sort((a, b) => {
      const pa = picks.find((x) => x.id === a.id);
      const pb = picks.find((x) => x.id === b.id);
      return (pa ? pickTimestamp(pa) : 0) - (pb ? pickTimestamp(pb) : 0);
    });

  sortByTs(importantes);
  sortByTs(futuros);

  const seen = new Set<string>();
  const out: OperacionalAgendaItem[] = [];
  const pushUnique = (arr: OperacionalAgendaItem[]) => {
    for (const it of arr) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      out.push(it);
    }
  };

  pushUnique(importantes.slice(0, 6));
  pushUnique(lives.slice(0, 6));
  pushUnique(futuros.slice(0, 8));

  const tsOf = (id: string) => {
    const p = picks.find((x) => x.id === id);
    return p ? pickTimestamp(p) : 0;
  };
  out.sort((a, b) => tsOf(a.id) - tsOf(b.id));

  return out;
}

export function buildProducao(
  todasAnalises: AnaliseRow[],
  picks: QuickPickRow[],
  ref: Date = new Date(),
): OperacionalProducao {
  const rascunhos = todasAnalises.filter((a) => a.status === "rascunho");
  const publicadasHoje = todasAnalises.filter(
    (a) => a.status === "publicado" && isIsoOnSameZonedDay(a.created_at, ref),
  ).length;

  const now = ref.getTime();
  const picksFuturas = picks.filter((p) => {
    if (p.status !== "ativo") return false;
    const ts = pickTimestamp(p);
    return ts > now;
  }).length;

  const ultimosRascunhos = todasAnalises
    .filter((a) => a.status === "rascunho")
    .slice(0, 5)
    .map((a) => ({
    slug: a.slug,
    titulo: a.titulo || "(sem título)",
    href: `/admin-editorial/editar/${encodeURIComponent(a.slug)}`,
  }));

  return {
    analisesRascunho: rascunhos.length,
    analisesPublicadasHoje: publicadasHoje,
    picksAtivasFuturas: picksFuturas,
    ultimosRascunhos,
  };
}

export function buildLeadsResumo(
  leads: { created_at: string }[],
  ref: Date = new Date(),
): OperacionalLeadsResumo {
  const total = leads.length;
  const hoje = leads.filter((l) => isIsoOnSameZonedDay(l.created_at, ref)).length;
  const t0 = ref.getTime();
  const weekMs = 7 * 86400000;
  const ultimos7Dias = leads.filter((l) => {
    const t = new Date(l.created_at).getTime();
    return Number.isFinite(t) && t >= t0 - weekMs && t <= t0;
  }).length;

  return { total, hoje, ultimos7Dias };
}

export function buildEsportesEmAlta(
  picks: QuickPickRow[],
  ref: Date = new Date(),
): { esporte: string; count: number }[] {
  const now = ref.getTime();
  const horizon = now + 48 * 3600000;
  const map = new Map<string, number>();

  for (const p of picks) {
    if (p.status !== "ativo") continue;
    const ts = pickTimestamp(p);
    if (ts < now || ts > horizon) continue;
    const k = p.esporte || "futebol";
    map.set(k, (map.get(k) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([esporte, count]) => ({ esporte, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export const OPERACIONAL_PERFORMANCE_PLACEHOLDERS: OperacionalPerformancePlaceholder[] = [
  {
    label: "Páginas mais acedidas",
    hint: "Ligar Plausible, GA4 ou Vercel Analytics — ainda sem tabela de pageviews no Supabase.",
  },
  {
    label: "Picks mais clicadas",
    hint: "Evento `pick_open` ou tracking nas cards — placeholder até instrumentar.",
  },
];
