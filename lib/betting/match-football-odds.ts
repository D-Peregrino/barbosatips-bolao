/**
 * Cruza fixtures (API-Football) com eventos (The Odds API): nomes + horário.
 * Não altera EV engine nem snapshots — só matching.
 */

import type { FootballFixtureSummary } from "@/lib/api-football/types";
import type { OddsFixtureEvent } from "@/services/the-odds-api.types";

/**
 * Janela temporal entre kickoff (API-Football) e commence (Odds API), após normalizar em UTC.
 * Temporariamente ±12h para absorver fusos / strings sem timezone.
 */
export const MATCH_TIME_WINDOW_MS = 12 * 60 * 60 * 1000;

const FORCE_MATCH_MIN_SCORE = 0.8;

const STOP_WORDS =
  /\b(fc|cf|sc|ac|ec|cd|sv|fk|sk|club|clube|a\.?\s*c\.?|a\/c|athletic|atletico)\b/gi;

/** Aliases → nome canónico (chave), após normalização base. */
const TEAM_ALIASES: Record<string, string[]> = {
  "atletico mineiro": ["atlético mineiro", "atletico mg"],
  internazionale: ["inter milan", "inter"],
  "paris saint germain": ["psg"],
  "manchester united": ["man utd"],
  "manchester city": ["man city"],
  "newcastle united": ["newcastle"],
  "tottenham hotspur": ["tottenham", "spurs"],
  "atletico madrid": ["atlético madrid"],
  "borussia monchengladbach": ["gladbach"],
};

function baseNormalizeTeamName(name: string): string {
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

function buildTeamAliasToCanonical(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [canonical, aliases] of Object.entries(TEAM_ALIASES)) {
    const canonKey = baseNormalizeTeamName(canonical);
    if (canonKey) map.set(canonKey, canonKey);
    for (const alt of aliases) {
      const k = baseNormalizeTeamName(alt);
      if (k) map.set(k, canonKey);
    }
  }
  return map;
}

const TEAM_ALIAS_TO_CANONICAL = buildTeamAliasToCanonical();

/** Normaliza nomes de equipas para comparação (incl. aliases manuais). */
export function normalizeTeamName(name: string): string {
  const s = baseNormalizeTeamName(name);
  if (!s) return s;
  return TEAM_ALIAS_TO_CANONICAL.get(s) ?? s;
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

/**
 * Converte ISO da API-Football / Odds para instante UTC em ms.
 * Strings sem sufixo de fuso (ex.: `2025-05-15T20:00:00`) são tratadas como **UTC**
 * (evita `Date` interpretar como hora local do servidor).
 */
export function parseToUtcMs(iso: string): number | null {
  const s = iso.trim();
  if (!s) return null;
  if (/[zZ]$|[+-]\d{2}:\d{2}$|[+-]\d{2}\d{2}$/.test(s)) {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : null;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?$/.test(s)) {
    const t = Date.parse(`${s}Z`);
    return Number.isFinite(t) ? t : null;
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

/** Diferença absoluta entre dois instantes ISO, sempre em UTC. */
export function msDiffUtc(isoA: string, isoB: string): number {
  const a = parseToUtcMs(isoA);
  const b = parseToUtcMs(isoB);
  if (a == null || b == null) return Number.POSITIVE_INFINITY;
  return Math.abs(a - b);
}

export function kickoffsWithinWindow(
  fixtureIso: string,
  commenceIso: string,
  windowMs = MATCH_TIME_WINDOW_MS,
): boolean {
  const d = msDiffUtc(fixtureIso, commenceIso);
  if (!Number.isFinite(d)) return false;
  return d <= windowMs;
}

const PRIMARY_MIN = 0.45; // DEBUG: era 0.70; relaxado para isolar rejeições
const FALLBACK_MIN = 0.35; // DEBUG: alinhado com HARD para aceitar candidatos médios
/** DEBUG: abaixo disto rejeita antes de fallback. */
const HARD_REJECT = 0.34;

export type OddsMatchScored = {
  event: OddsFixtureEvent;
  score: number;
  swapped: boolean;
  ms: number;
};

export type ResolveOddsMatchResult = {
  event: OddsFixtureEvent | null;
  ranked: OddsMatchScored[];
  rejectReason: string | null;
  /** Match aceite só pelo atalho score > 0.8 (validação de pipeline). */
  kickoffForcedAccept?: boolean;
};

function warnMatchDebug(
  fixture: FootballFixtureSummary,
  events: OddsFixtureEvent[],
  scored: OddsMatchScored[],
  rejectReason: string | null,
): void {
  console.warn("[MATCH DEBUG]", {
    fixture: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
    fixtureDate: fixture.dateIso,
    totalOddsEvents: events.length,
    top3: scored.slice(0, 3).map((x) => ({
      score: x.score,
      swapped: x.swapped,
      msDiff: x.ms,
      oddsHome: x.event.homeTeam,
      oddsAway: x.event.awayTeam,
      commence: x.event.commenceTime,
    })),
    rejectReason,
  });
}

/**
 * Resolve o melhor evento Odds para um fixture, com ranking e motivo de rejeição.
 */
export function resolveOddsMatchForFixture(
  fixture: FootballFixtureSummary,
  events: OddsFixtureEvent[],
): ResolveOddsMatchResult {
  const inWindow = events.filter((e) =>
    kickoffsWithinWindow(fixture.dateIso, e.commenceTime),
  );

  const scored: OddsMatchScored[] = [];
  for (const e of inWindow) {
    const { score, swapped } = fixtureEventPairScore(fixture, e);
    if (score > 0.6) {
      console.warn(
        "[MATCH]",
        fixture.homeTeam,
        "vs",
        fixture.awayTeam,
        "=>",
        e.homeTeam,
        "vs",
        e.awayTeam,
        "score:",
        score,
      );
    }
    scored.push({
      event: e,
      score,
      swapped,
      ms: msDiffUtc(fixture.dateIso, e.commenceTime),
    });
  }

  if (scored.length === 0) {
    const rejectReason = "no_odds_events_in_kickoff_window_12h_utc";
    warnMatchDebug(fixture, events, scored, rejectReason);
    return {
      event: null,
      ranked: [],
      rejectReason,
    };
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.ms - b.ms;
  });

  const top = scored[0];
  let event: OddsFixtureEvent | null = null;
  let rejectReason: string | null = null;

  if (top.score < HARD_REJECT) {
    rejectReason = `best_score_below_hard_reject (${top.score.toFixed(3)} < ${HARD_REJECT})`;
  } else if (top.score >= PRIMARY_MIN) {
    event = top.event;
  } else if (top.score >= FALLBACK_MIN) {
    // DEBUG: ambiguidade (2º candidato muito próximo) desativada — aceita sempre o top.
    event = top.event;
  } else {
    rejectReason = `best_score_below_fallback_min (${top.score.toFixed(3)} < ${FALLBACK_MIN})`;
  }

  let kickoffForcedAccept = false;
  if (!event && top.score > FORCE_MATCH_MIN_SCORE) {
    event = top.event;
    rejectReason = "temp_forced_score_gt_0.8";
    kickoffForcedAccept = true;
  }

  if (!event && rejectReason) {
    warnMatchDebug(fixture, events, scored, rejectReason);
  }

  return {
    event,
    ranked: scored,
    rejectReason: event ? null : rejectReason,
    kickoffForcedAccept,
  };
}

/**
 * 1) Janela ±12h (UTC).
 * 2) Melhor score entre orientação normal e casa/fora trocados.
 * 3) Fallback + atalho temporário score > 0.8.
 */
export function findOddsEventForFixture(
  fixture: FootballFixtureSummary,
  events: OddsFixtureEvent[],
): OddsFixtureEvent | null {
  return resolveOddsMatchForFixture(fixture, events).event;
}

/** Diferença de kickoff legível (ambos normalizados em UTC). */
export function formatKickoffDelta(fixtureIso: string, commenceIso: string): string {
  const a = parseToUtcMs(fixtureIso);
  const b = parseToUtcMs(commenceIso);
  if (a == null || b == null) {
    return "kickoff_invalid_iso";
  }
  const d = Math.abs(a - b);
  const min = Math.round(d / 60000);
  const h = (d / (60 * 60 * 1000)).toFixed(2);
  return `${min}min (~${h}h)`;
}

/** Linha de diagnóstico: raw ISO, instantes UTC, Δ minutos, timezone do runtime. */
export function formatKickoffDebugLine(
  fixtureIso: string,
  commenceIso: string,
  label = "kickoff",
): string {
  const ta = parseToUtcMs(fixtureIso);
  const tb = parseToUtcMs(commenceIso);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const rawA = JSON.stringify(fixtureIso);
  const rawB = JSON.stringify(commenceIso);
  if (ta == null || tb == null) {
    return `[${label}] fixture.date=${rawA} commence=${rawB} | utc_parse_fail | runtime_tz=${tz}`;
  }
  const dm = Math.round(Math.abs(ta - tb) / 60000);
  return (
    `[${label}] fixture.date=${rawA} commence=${rawB} | ` +
    `utc_fixture=${new Date(ta).toISOString()} utc_commence=${new Date(tb).toISOString()} | ` +
    `Δ=${dm}min | runtime_tz=${tz}`
  );
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
      `[mercados-match] fixture: ${label} | nenhum evento odds na janela ±12h UTC (${events.length} eventos totais)`,
    );
    const byTime = [...events]
      .map((e) => ({
        e,
        ms: msDiffUtc(fixture.dateIso, e.commenceTime),
      }))
      .sort((a, b) => a.ms - b.ms)
      .slice(0, maxEvents);
    for (const { e, ms } of byTime) {
      const h = (ms / (60 * 60 * 1000)).toFixed(1);
      const { score } = fixtureEventPairScore(fixture, e);
      lines.push(
        `  ↳ mais próximo: ${e.homeTeam} vs ${e.awayTeam} @ ${e.commenceTime} | Δ≈${h}h | score=${score.toFixed(2)} (fora da janela 12h UTC)`,
      );
    }
    return lines;
  }

  const ranked = inWindow
    .map((e) => {
      const { score, swapped } = fixtureEventPairScore(fixture, e);
      return { e, score, swapped, ms: msDiffUtc(fixture.dateIso, e.commenceTime) };
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
