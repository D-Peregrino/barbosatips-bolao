import type { AnaliseRow } from "@/lib/analises/types";
import { buildHomePerformanceSnapshot } from "@/lib/home/home-performance";
import { buildHomeTickerItems } from "@/lib/home/home-ticker";
import { melhoresGreens, picksQuentes, trendingPicks } from "@/lib/home/home-highlights";
import type { QuickPickRow } from "@/lib/picks/types";
import type { LiveActivityLine, LivePickSlim, LiveSummaryPayload } from "@/lib/live/types";
import { minutosAtrasPt } from "@/lib/live/time-ago";

function parseTime(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function pickBadges(p: QuickPickRow): LivePickSlim["badges"] {
  const badges: LivePickSlim["badges"] = [];
  if (p.is_premium) badges.push("PREMIUM");
  if (p.status === "ativo" && (p.confianca >= 82 || p.odd >= 2.05)) badges.push("HOT");
  return badges;
}

function toSlim(p: QuickPickRow): LivePickSlim {
  return {
    id: p.id,
    jogo: p.jogo,
    mercado: p.mercado,
    odd: p.odd,
    status: p.status,
    resultado: p.resultado,
    is_premium: p.is_premium,
    confianca: p.confianca,
    esporte: p.esporte,
    badges: pickBadges(p),
  };
}

/** Maior sequência de greens consecutivos no histórico ordenado por horário do jogo. */
export function bestGreenStreak(picks: QuickPickRow[]): number {
  const closed = picks
    .filter(
      (p) =>
        p.status === "encerrado" &&
        (p.resultado === "green" || p.resultado === "red"),
    )
    .sort((a, b) => parseTime(a.horario_jogo) - parseTime(b.horario_jogo));

  let best = 0;
  let cur = 0;
  for (const p of closed) {
    if (p.resultado === "green") {
      cur += 1;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
}

function buildActivityLines(
  picks: QuickPickRow[],
  analises: AnaliseRow[],
  now: number,
): LiveActivityLine[] {
  const lines: LiveActivityLine[] = [];

  const sortedByCreated = [...picks].sort(
    (a, b) => parseTime(b.created_at) - parseTime(a.created_at),
  );
  const newest = sortedByCreated[0];
  if (newest) {
    const rel = minutosAtrasPt(newest.created_at, now);
    lines.push({
      id: `pick-new-${newest.id}`,
      kind: "pick",
      text: `Nova pick publicada ${rel} · ${newest.jogo.slice(0, 42)}${newest.jogo.length > 42 ? "…" : ""}`,
    });
  }

  const lastGreen = picks
    .filter((p) => p.status === "encerrado" && p.resultado === "green")
    .sort((a, b) => parseTime(b.horario_jogo) - parseTime(a.horario_jogo))[0];
  if (lastGreen) {
    lines.push({
      id: `green-${lastGreen.id}`,
      kind: "green",
      text: `Green confirmado · ${lastGreen.jogo} @ ${lastGreen.odd.toFixed(2)}`,
    });
  }

  const lastRed = picks
    .filter((p) => p.status === "encerrado" && p.resultado === "red")
    .sort((a, b) => parseTime(b.horario_jogo) - parseTime(a.horario_jogo))[0];
  if (lastRed) {
    lines.push({
      id: `red-${lastRed.id}`,
      kind: "red",
      text: `Atualização · ${lastRed.jogo} encerrada (red)`,
    });
  }

  const tenis = analises.find((a) => a.esporte === "tenis");
  if (tenis) {
    lines.push({
      id: `analise-${tenis.id}`,
      kind: "analise",
      text: `Nova análise de tênis · ${tenis.titulo.slice(0, 48)}${tenis.titulo.length > 48 ? "…" : ""}`,
    });
  }

  const livePick = picks
    .filter((p) => p.status === "ativo")
    .sort((a, b) => parseTime(b.horario_jogo) - parseTime(a.horario_jogo))[0];
  if (livePick) {
    lines.push({
      id: `ativo-${livePick.id}`,
      kind: "ativo",
      text: `Jogo ao vivo na grade · ${livePick.jogo} · ${livePick.mercado} @ ${livePick.odd.toFixed(2)}`,
    });
  }

  const seenText = new Set<string>();
  const dedup: LiveActivityLine[] = [];
  for (const line of lines) {
    if (seenText.has(line.text)) continue;
    seenText.add(line.text);
    dedup.push(line);
    if (dedup.length >= 6) break;
  }
  return dedup;
}

/**
 * Snapshot leve para API /live e página inicial (polling).
 * `picks` e `analises` já devem respeitar o filtro premium do viewer.
 */
export function buildLiveSummaryPayload(
  picks: QuickPickRow[],
  analises: AnaliseRow[],
  now = Date.now(),
): LiveSummaryPayload {
  const perf = buildHomePerformanceSnapshot(picks);
  const ativos = picks.filter((p) => p.status === "ativo");
  const odds = ativos.map((p) => p.odd).filter((o) => o > 0);
  const oddMediaAtivos =
    odds.length > 0
      ? Math.round((odds.reduce((a, b) => a + b, 0) / odds.length) * 100) / 100
      : null;

  const quentes = picksQuentes(picks, 4);
  const greensTop = melhoresGreens(picks, 4);
  const exclude = new Set([...quentes, ...greensTop].map((p) => p.id));
  const trendingRows = trendingPicks(picks, 6, exclude);

  return {
    updatedAt: new Date(now).toISOString(),
    counts: {
      greens: perf.greens,
      reds: perf.reds,
      voids: perf.voids,
      ativos: ativos.length,
      oddMediaAtivos,
    },
    performance: {
      taxaAcertoPct: perf.taxaAcertoPct,
      streakAtual: perf.streakAtual,
      bestGreenStreak: bestGreenStreak(picks),
    },
    tickerItems: buildHomeTickerItems(picks.slice(0, 14)),
    activity: buildActivityLines(picks, analises, now),
    recentPicks: picks.slice(0, 12).map(toSlim),
    trending: trendingRows.map(toSlim),
  };
}
