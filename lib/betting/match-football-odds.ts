/**
 * Cruza fixtures (API-Football) com eventos (The Odds API): nomes + horário.
 * Não altera EV engine nem snapshots — só matching.
 */

import type { FootballFixtureSummary } from "@/lib/api-football/types";
import type { OddsFixtureEvent } from "@/services/the-odds-api.types";

/** ±4h entre kickoff Football e commence Odds (fusos / arredondamentos). */
export const MATCH_TIME_WINDOW_MS = 4 * 60 * 60 * 1000;

const STOP_WORDS =
  /\b(fc|cf|sc|ac|ec|cd|sv|fk|sk|club|clube|a\.?\s*c\.?|a\/c|athletic|atletico)\b/gi;

/** Normaliza nomes de equipas para comparação. */
export function normalizeTeamName(name: string): string {
  let s = name.trim().toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/-/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(STOP_WORDS, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.replace(/[^a-z0-9]/g, "");
}

function diceBigramSimilarity(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  let matches = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    const c = bigrams.get(bg);
    if (c && c > 0) {
      matches++;
      bigrams.set(bg, c - 1);
    }
  }
  return (2 * matches) / (a.length - 1 + b.length - 1);
}

/** 0..1 — igualdade, substring longa ou coeficiente de bigramas. */
export function teamSimilarity(a: string, b: string): number {
  const A = normalizeTeamName(a);
  const B = normalizeTeamName(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  const [shorter, longer] = A.length <= B.length ? [A, B] : [B, A];
  if (shorter.length >= 3 && longer.includes(shorter)) return 0.94;
  if (shorter.length >= 4 && longer.length >= 4) {
    if (A.includes(B) || B.includes(A)) return 0.9;
  }
  return diceBigramSimilarity(A, B);
}

/** Usado em outcomes H2H e no match de fixture↔evento. */
export function teamsMatch(a: string, b: string): boolean {
  return teamSimilarity(a, b) >= 0.86;
}

function pairScore(
  fh: string,
  fa: string,
  oddsHome: string,
  oddsAway: string,
): number {
  return (teamSimilarity(fh, oddsHome) + teamSimilarity(fa, oddsAway)) / 2;
}

function fixtureEventPairScore(
  fixture: FootballFixtureSummary,
  event: OddsFixtureEvent,
): { score: number; swapped: boolean } {
  const straight = pairScore(
    fixture.homeTeam,
    fixture.awayTeam,
    event.homeTeam,
    event.awayTeam,
  );
  const swapped = pairScore(
    fixture.homeTeam,
    fixture.awayTeam,
    event.awayTeam,
    event.homeTeam,
  );
  if (swapped > straight) return { score: swapped, swapped: true };
  return { score: straight, swapped: false };
}

function msDiff(isoA: string, isoB: string): number {
  const t1 = new Date(isoA).getTime();
  const t2 = new Date(isoB).getTime();
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return 0;
  return Math.abs(t1 - t2);
}

export function kickoffsWithinWindow(
  fixtureIso: string,
  commenceIso: string,
  windowMs = MATCH_TIME_WINDOW_MS,
): boolean {
  const d = msDiff(fixtureIso, commenceIso);
  if (
    d === 0 &&
    (!Number.isFinite(new Date(fixtureIso).getTime()) ||
      !Number.isFinite(new Date(commenceIso).getTime()))
  ) {
    return true;
  }
  return d <= windowMs;
}

const PRIMARY_MIN = 0.78;
const FALLBACK_MIN = 0.58;
const HARD_REJECT = 0.52;

/**
 * 1) Janela ±4h.
 * 2) Melhor score entre orientação normal e casa/fora trocados.
 * 3) Fallback: mesmo critério, aceita score mais baixo com desempate por horário.
 */
export function findOddsEventForFixture(
  fixture: FootballFixtureSummary,
  events: OddsFixtureEvent[],
): OddsFixtureEvent | null {
  const inWindow = events.filter((e) =>
    kickoffsWithinWindow(fixture.dateIso, e.commenceTime),
  );

  type Scored = {
    event: OddsFixtureEvent;
    score: number;
    swapped: boolean;
    ms: number;
  };

  const scored: Scored[] = [];
  for (const e of inWindow) {
    const { score, swapped } = fixtureEventPairScore(fixture, e);
    scored.push({
      event: e,
      score,
      swapped,
      ms: msDiff(fixture.dateIso, e.commenceTime),
    });
  }

  if (scored.length === 0) return null;

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.ms - b.ms;
  });

  const top = scored[0];
  if (top.score < HARD_REJECT) return null;

  if (top.score >= PRIMARY_MIN) {
    return top.event;
  }

  if (top.score >= FALLBACK_MIN) {
    if (scored.length > 1) {
      const sec = scored[1];
      const closeScore = sec.score >= top.score - 0.05;
      const closeTime = Math.abs(top.ms - sec.ms) < 25 * 60 * 1000;
      if (top.score < 0.72 && closeScore && closeTime) {
        return null;
      }
    }
    return top.event;
  }

  return null;
}

/** Linhas para console quando MARKET_BOARD_MATCH_DEBUG=1 */
export function formatMatchDebugNoEvent(
  fixture: FootballFixtureSummary,
  events: OddsFixtureEvent[],
  maxEvents = 4,
): string[] {
  const lines: string[] = [];
  const label = `${fixture.homeTeam} vs ${fixture.awayTeam} (${fixture.dateIso})`;

  const inWindow = events.filter((e) =>
    kickoffsWithinWindow(fixture.dateIso, e.commenceTime),
  );
  if (inWindow.length === 0) {
    lines.push(
      `[mercados-match] fixture: ${label} | nenhum evento odds na janela ±4h (${events.length} eventos totais)`,
    );
    const byTime = [...events]
      .map((e) => ({
        e,
        ms: msDiff(fixture.dateIso, e.commenceTime),
      }))
      .sort((a, b) => a.ms - b.ms)
      .slice(0, maxEvents);
    for (const { e, ms } of byTime) {
      const h = Math.round(ms / (60 * 60 * 1000));
      const { score } = fixtureEventPairScore(fixture, e);
      lines.push(
        `  ↳ mais próximo: ${e.homeTeam} vs ${e.awayTeam} @ ${e.commenceTime} | Δ≈${h}h | score=${score.toFixed(2)} (fora da janela 4h)`,
      );
    }
    return lines;
  }

  const ranked = inWindow
    .map((e) => {
      const { score, swapped } = fixtureEventPairScore(fixture, e);
      return { e, score, swapped, ms: msDiff(fixture.dateIso, e.commenceTime) };
    })
    .sort((a, b) => b.score - a.score || a.ms - b.ms);

  const best = ranked[0];
  let reason = `melhor score=${best.score.toFixed(2)} (abaixo de ${FALLBACK_MIN})`;
  if (best.score >= FALLBACK_MIN && ranked.length > 1) {
    const sec = ranked[1];
    const closeScore = sec.score >= best.score - 0.05;
    const closeTime = Math.abs(best.ms - sec.ms) < 25 * 60 * 1000;
    if (best.score < 0.72 && closeScore && closeTime) {
      reason = `ambiguidade: score=${best.score.toFixed(2)} vs segundo=${sec.score.toFixed(2)} na mesma janela de tempo`;
    }
  }

  lines.push(`[mercados-match] fixture: ${label} | sem match | ${reason}`);
  for (let i = 0; i < Math.min(maxEvents, ranked.length); i++) {
    const { e, score, swapped } = ranked[i];
    lines.push(
      `  ↳ odds: ${e.homeTeam} vs ${e.awayTeam} @ ${e.commenceTime} | score=${score.toFixed(2)}${swapped ? " (swapped)" : ""}`,
    );
  }
  return lines;
}
