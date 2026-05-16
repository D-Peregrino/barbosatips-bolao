import { fetchFixturesByDate, getApiFootballKey, todayDateBrazil } from "@/lib/api-football/client";
import { computeMatchTrends, computeTeamForm } from "@/lib/api-football/form-trends";
import { fetchTeamLastFixtures } from "@/lib/api-football/team-fixtures";
import type {
  ApiFootballRawFixture,
  FootballFixtureSummary,
  TeamRecentForm,
} from "@/lib/api-football/types";
import { generateMarketInsight } from "@/lib/betting/ev-engine";
import type { EvTier } from "@/lib/betting/ev-engine";
import {
  formatKickoffDebugLine,
  formatKickoffDelta,
  formatMatchDebugNoEvent,
  MATCH_TIME_WINDOW_MS,
  normalizeTeamName,
  resolveOddsMatchForFixture,
  teamsMatch,
} from "@/lib/betting/match-football-odds";
import { fetchSportOddsEvents, getOddsApiKey } from "@/services/the-odds-api";
import type { OddsFixtureEvent } from "@/services/the-odds-api.types";

console.warn("[EV PIPELINE] arquivo carregado");

export const MARKET_BOARD_LIMIT = 30;

export const BOARD_MARKET_LABELS = [
  "Over 2.5",
  "Home Win",
  "Away Win",
] as const;

export type BoardMarketLabel = (typeof BOARD_MARKET_LABELS)[number];

export type MarketBoardRow = {
  id: string;
  fixtureId: number;
  oddsEventId: string | null;
  matchLabel: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  kickoffLabel: string;
  kickoffAtIso: string | null;
  marketLabel: BoardMarketLabel;
  marketOdd: number;
  fairOdd: number;
  realProbability: number;
  impliedProbability: number;
  edge: number;
  ev: number;
  tier: EvTier;
  bookmaker: string | null;
};

export type MarketBoardMeta = {
  date: string;
  fixturesTotal: number;
  fixturesMatched: number;
  oddsEventsTotal: number;
  rowsBeforeLimit: number;
  sportKeys: string[];
  warnings: string[];
};

export type MarketBoardResult =
  | { ok: true; rows: MarketBoardRow[]; meta: MarketBoardMeta }
  | { ok: false; error: string };

const DEFAULT_SPORT_KEYS = [
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "soccer_brazil_campeonato",
  "soccer_uefa_champs_league",
];

function sportKeysFromEnv(): string[] {
  const raw = process.env.MARKET_BOARD_SPORT_KEYS?.trim();
  if (!raw) return DEFAULT_SPORT_KEYS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidDecimalOdd(price: number): boolean {
  return Number.isFinite(price) && price > 1 && price < 100;
}

function outcomeMatchesTeam(outcomeName: string, teamName: string): boolean {
  return teamsMatch(outcomeName, teamName);
}

type BestQuote = { odd: number; bookmaker: string };

function pickBest(quotes: BestQuote[]): BestQuote | null {
  if (quotes.length === 0) return null;
  return quotes.reduce((a, b) => (b.odd > a.odd ? b : a));
}

function collectH2H(event: OddsFixtureEvent, teamName: string): BestQuote | null {
  const quotes: BestQuote[] = [];
  for (const bm of event.bookmakers) {
    for (const market of bm.markets) {
      if (market.key !== "h2h") continue;
      for (const o of market.outcomes) {
        if (outcomeMatchesTeam(o.name, teamName) && isValidDecimalOdd(o.price)) {
          quotes.push({ odd: o.price, bookmaker: bm.title });
        }
      }
    }
  }
  return pickBest(quotes);
}

function collectOver25(event: OddsFixtureEvent): BestQuote | null {
  const quotes: BestQuote[] = [];
  for (const bm of event.bookmakers) {
    for (const market of bm.markets) {
      if (market.key !== "totals") continue;
      for (const o of market.outcomes) {
        if (!/^over/i.test(o.name)) continue;
        if (o.point != null && Math.abs(o.point - 2.5) > 0.01) continue;
        if (isValidDecimalOdd(o.price)) {
          quotes.push({ odd: o.price, bookmaker: bm.title });
        }
      }
    }
  }
  return pickBest(quotes);
}

function winRatePct(form: TeamRecentForm): number | null {
  const total = form.wins + form.draws + form.losses;
  if (total === 0) return null;
  return Math.round((form.wins / total) * 100);
}

function dedupeFixtures(fixtures: ApiFootballRawFixture[]) {
  const seen = new Set<number>();
  const out: ApiFootballRawFixture[] = [];
  for (const f of fixtures) {
    const id = f.fixture?.id;
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    out.push(f);
  }
  return out;
}

async function loadTrendsForFixture(fixture: FootballFixtureSummary) {
  const homeId = fixture.homeTeamId;
  const awayId = fixture.awayTeamId;
  if (!homeId || !awayId) return null;

  const [homeLast, awayLast] = await Promise.all([
    fetchTeamLastFixtures(homeId, 5),
    fetchTeamLastFixtures(awayId, 5),
  ]);

  const pool = dedupeFixtures([...homeLast, ...awayLast]);
  const trends = computeMatchTrends(pool);
  const homeForm = computeTeamForm(homeLast, homeId);
  const awayForm = computeTeamForm(awayLast, awayId);

  return { trends, homeForm, awayForm };
}

type PipelineTrySkip = {
  fixtureId: number;
  matchLabel: string;
  marketLabel: BoardMarketLabel;
  reason: string;
  detail?: string;
};

type PipelineTrySuccess = {
  fixtureId: number;
  matchLabel: string;
  marketLabel: BoardMarketLabel;
  ev: number;
  edge: number;
  tier: EvTier;
};

function tryAddRow(
  rows: MarketBoardRow[],
  params: {
    fixture: FootballFixtureSummary;
    oddsEvent: OddsFixtureEvent;
    marketLabel: BoardMarketLabel;
    realProbability: number | null;
    quote: BestQuote | null;
    probabilityRejectReason?: string;
  },
  pipelineRecorder?: {
    skips: PipelineTrySkip[];
    successes: PipelineTrySuccess[];
    maxSkips: number;
    maxSuccesses: number;
  },
): boolean {
  const { fixture, oddsEvent, marketLabel, realProbability, quote, probabilityRejectReason } =
    params;
  const recordSkip = (reason: string, detail?: string) => {
    if (!pipelineRecorder || pipelineRecorder.skips.length >= pipelineRecorder.maxSkips) return;
    pipelineRecorder.skips.push({
      fixtureId: fixture.fixtureId,
      matchLabel: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      marketLabel,
      reason,
      detail,
    });
  };

  const trendsPayload =
    realProbability != null && realProbability > 0 && realProbability < 100
      ? marketLabel === "Over 2.5"
        ? { source: "match_trends_pool", metric: "over25Pct", value: realProbability }
        : {
            source: "team_last_fixtures_form",
            metric: "winRatePct",
            value: realProbability,
            side: marketLabel,
          }
      : null;

  const logSkip = (reason: string, detail?: string) => {
    console.warn("[EV REJECT]", {
      market: marketLabel,
      reason,
      fixture: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      probability: realProbability,
      odd: quote?.odd ?? null,
      trends: trendsPayload,
      bookmaker: quote?.bookmaker ?? null,
      detail: detail ?? null,
    });
    recordSkip(reason, detail);
  };

  if (realProbability == null || realProbability <= 0 || realProbability >= 100) {
    const reason = probabilityRejectReason ?? "probability_out_of_range_or_missing";
    logSkip(
      reason,
      `realProbability=${realProbability === null ? "null" : String(realProbability)}`,
    );
    return false;
  }
  if (!quote || !isValidDecimalOdd(quote.odd)) {
    logSkip(
      "no_quote_or_invalid_odd",
      quote ? `odd=${String(quote.odd)}` : "quote=null",
    );
    return false;
  }

  try {
    const insight = generateMarketInsight({
      marketLabel,
      realProbability,
      marketOdd: quote.odd,
    });

    rows.push({
      id: `${fixture.fixtureId}-${marketLabel.replace(/\s+/g, "-").toLowerCase()}`,
      fixtureId: fixture.fixtureId,
      oddsEventId: oddsEvent.id,
      matchLabel: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.leagueName,
      country: fixture.country,
      kickoffLabel: fixture.kickoffLabel,
      kickoffAtIso: fixture.dateIso || null,
      marketLabel,
      marketOdd: insight.marketOdd,
      fairOdd: insight.fairOdd,
      realProbability: insight.realProbability,
      impliedProbability: insight.impliedProbability,
      edge: insight.edge,
      ev: insight.ev,
      tier: insight.tier,
      bookmaker: quote.bookmaker,
    });

    console.warn("[EV OK]", marketLabel, {
      fixture: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      probability: insight.realProbability,
      odd: insight.marketOdd,
      ev: insight.ev,
      edge: insight.edge,
      tier: insight.tier,
    });

    if (
      pipelineRecorder &&
      pipelineRecorder.successes.length < pipelineRecorder.maxSuccesses
    ) {
      pipelineRecorder.successes.push({
        fixtureId: fixture.fixtureId,
        matchLabel: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
        marketLabel,
        ev: insight.ev,
        edge: insight.edge,
        tier: insight.tier,
      });
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[EV REJECT]", {
      market: marketLabel,
      reason: "ev_engine_exception",
      fixture: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      probability: realProbability,
      odd: quote?.odd ?? null,
      trends: trendsPayload,
      bookmaker: quote?.bookmaker ?? null,
      error: msg,
    });
    recordSkip("ev_engine_exception", msg);
    return false;
  }
}

export async function buildMarketBoard(options?: {
  date?: string;
  limit?: number;
}): Promise<MarketBoardResult> {
  console.warn("[EV PIPELINE] buildMarketBoard iniciou");
  const date = options?.date ?? todayDateBrazil();
  const limit = options?.limit ?? MARKET_BOARD_LIMIT;
  const warnings: string[] = [];

  if (!getApiFootballKey()) {
    return { ok: false, error: "API_FOOTBALL_KEY ausente" };
  }
  if (!getOddsApiKey()) {
    return { ok: false, error: "ODDS_API_KEY ausente" };
  }

  const fixturesResult = await fetchFixturesByDate(date);
  if (!fixturesResult.ok) {
    return { ok: false, error: fixturesResult.error };
  }

  console.warn("[EV PIPELINE] fixtures", fixturesResult.fixtures.length);

  const sportKeys = sportKeysFromEnv();
  const oddsResults = await Promise.all(sportKeys.map((key) => fetchSportOddsEvents(key)));
  const allOddsEvents: OddsFixtureEvent[] = [];
  for (const r of oddsResults) {
    if (r.ok) allOddsEvents.push(...r.data);
    else warnings.push(`Odds ${r.error}`);
  }

  console.warn("[EV PIPELINE] oddsEvents", allOddsEvents.length);

  if (allOddsEvents.length === 0) {
    return {
      ok: false,
      error: "Nenhum evento com odds encontrado nas ligas configuradas",
    };
  }

  const rows: MarketBoardRow[] = [];
  let matched = 0;
  const matchDebug = process.env.MARKET_BOARD_MATCH_DEBUG === "1";
  const pipelineDebug = process.env.MARKET_BOARD_PIPELINE_DEBUG === "1";
  let matchDebugLines = 0;
  const maxMatchDebugFixtures = 10;

  const pipelineRecorder = pipelineDebug
    ? {
        skips: [] as PipelineTrySkip[],
        successes: [] as PipelineTrySuccess[],
        maxSkips: 48,
        maxSuccesses: 14,
      }
    : undefined;

  let fixturesNoOddsMatch = 0;
  let fixturesOddsButNoTrends = 0;
  let marketsTryAddInvoked = 0;
  const noOddsMatchSamples: string[] = [];
  const oddsMatchOkSamples: string[] = [];
  const noTrendsSamples: string[] = [];

  let kickoffForcedCount = 0;
  let kickoffDetailLogs = 0;
  const maxKickoffDetailLogs = 5;

  for (const fixture of fixturesResult.fixtures) {
    const oddsMatch = resolveOddsMatchForFixture(fixture, allOddsEvents);
    if (!oddsMatch.event) {
      fixturesNoOddsMatch += 1;
      if (matchDebug && matchDebugLines < maxMatchDebugFixtures) {
        matchDebugLines += 1;
        for (const line of formatMatchDebugNoEvent(fixture, allOddsEvents)) {
          console.warn(line);
        }
      }
      if (pipelineDebug && noOddsMatchSamples.length < 6 && oddsMatch.rejectReason) {
        noOddsMatchSamples.push(
          `#${fixture.fixtureId} ${fixture.homeTeam} vs ${fixture.awayTeam} @ ${fixture.dateIso} → ${oddsMatch.rejectReason}`,
        );
      }
      continue;
    }

    const oddsEvent = oddsMatch.event;
    console.warn(
      "[MATCHED FIXTURE]",
      fixture.homeTeam,
      "vs",
      fixture.awayTeam,
      "league:",
      fixture.leagueName,
      "odds:",
      oddsEvent.homeTeam,
      "vs",
      oddsEvent.awayTeam,
    );

    matched += 1;
    if (oddsMatch.kickoffForcedAccept) {
      kickoffForcedCount += 1;
    }
    const best = oddsMatch.ranked[0];
    if (pipelineDebug && kickoffDetailLogs < maxKickoffDetailLogs && oddsEvent) {
      kickoffDetailLogs += 1;
      console.warn(
        formatKickoffDebugLine(
          fixture.dateIso,
          oddsEvent.commenceTime,
          `fixture#${fixture.fixtureId}`,
        ),
      );
      for (const c of oddsMatch.ranked.slice(0, 3)) {
        const dm = Math.round(c.ms / 60000);
        console.warn(
          `[kickoff_candidate] score=${c.score.toFixed(3)} swapped=${c.swapped} Δmin=${dm} ` +
            `id=${c.event.id} ${c.event.homeTeam} vs ${c.event.awayTeam} @ ${c.event.commenceTime}`,
        );
      }
    }
    if (pipelineDebug && oddsMatchOkSamples.length < 5 && best) {
      const kd = formatKickoffDelta(fixture.dateIso, oddsEvent.commenceTime);
      oddsMatchOkSamples.push(
        `match_ok #${fixture.fixtureId} score=${best.score.toFixed(3)} swapped=${String(best.swapped)} kickoff=${kd} | ` +
          `norm F[${normalizeTeamName(fixture.homeTeam)},${normalizeTeamName(fixture.awayTeam)}] ` +
          `↔ O[${normalizeTeamName(oddsEvent.homeTeam)},${normalizeTeamName(oddsEvent.awayTeam)}] | id=${oddsEvent.id}`,
      );
    }

    const trendData = await loadTrendsForFixture(fixture);
    if (!trendData) {
      fixturesOddsButNoTrends += 1;
      console.warn("[EV REJECT]", {
        market: "all",
        reason: "trends_missing",
        fixture: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
        probability: null,
        odd: null,
        homeTeamId: fixture.homeTeamId ?? null,
        awayTeamId: fixture.awayTeamId ?? null,
      });
      if (pipelineDebug && noTrendsSamples.length < 5) {
        noTrendsSamples.push(
          `no_trends #${fixture.fixtureId} ${fixture.homeTeam} vs ${fixture.awayTeam} | homeId=${fixture.homeTeamId ?? "null"} awayId=${fixture.awayTeamId ?? "null"}`,
        );
      }
      continue;
    }

    marketsTryAddInvoked += 3;

    const { trends, homeForm, awayForm } = trendData;
    const homeWinPct = winRatePct(homeForm);
    const awayWinPct = winRatePct(awayForm);

    tryAddRow(
      rows,
      {
        fixture,
        oddsEvent,
        marketLabel: "Over 2.5",
        realProbability: trends.sampleSize > 0 ? trends.over25Pct : null,
        quote: collectOver25(oddsEvent),
        probabilityRejectReason:
          trends.sampleSize > 0 ? undefined : "sample_size_zero",
      },
      pipelineRecorder,
    );

    tryAddRow(
      rows,
      {
        fixture,
        oddsEvent,
        marketLabel: "Home Win",
        realProbability: homeWinPct,
        quote: collectH2H(oddsEvent, fixture.homeTeam),
      },
      pipelineRecorder,
    );

    tryAddRow(
      rows,
      {
        fixture,
        oddsEvent,
        marketLabel: "Away Win",
        realProbability: awayWinPct,
        quote: collectH2H(oddsEvent, fixture.awayTeam),
      },
      pipelineRecorder,
    );
  }

  warnings.push(
    `[kickoff] fixtures_matched_odds_real=${matched} forced_score_gt_0_8=${kickoffForcedCount} window_ms=${MATCH_TIME_WINDOW_MS} (parseToUtcMs) runtime_tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  );

  if (pipelineDebug) {
    const rowsBeforeSort = rows.length;
    const summary = [
      `[mercados-pipeline] — resumo (MARKET_BOARD_PIPELINE_DEBUG=1)`,
      `[mercados-pipeline] 1) odds: sportKeys=${sportKeys.join(",")} | events_total=${allOddsEvents.length} | api_warnings=${warnings.filter((w) => w.startsWith("Odds")).length}`,
      `[mercados-pipeline] 2) fixtures API-Football (dia completo): ${fixturesResult.fixtures.length}`,
      `[mercados-pipeline] 3) matching: fixtures_matched_odds=${matched} (forced_gt0_8=${kickoffForcedCount}) | fixtures_sem_match_odds=${fixturesNoOddsMatch} | odds_ok_sem_trends=${fixturesOddsButNoTrends}`,
      `[mercados-pipeline] 4) tryAddRow calls=${marketsTryAddInvoked} (3 por jogo com trends)`,
      `[mercados-pipeline] 5) ev_rows_geradas=${rowsBeforeSort} (antes sort/limit)`,
    ];
    for (const line of summary) console.warn(line);
    for (const s of oddsMatchOkSamples) console.warn(`[mercados-pipeline] exemplo_match: ${s}`);
    for (const s of noOddsMatchSamples) console.warn(`[mercados-pipeline] exemplo_sem_odds: ${s}`);
    for (const s of noTrendsSamples) console.warn(`[mercados-pipeline] exemplo_sem_trends: ${s}`);
    if (pipelineRecorder) {
      for (const s of pipelineRecorder.successes) {
        console.warn(
          `[mercados-pipeline] ev_ok #${s.fixtureId} ${s.marketLabel} ev=${s.ev.toFixed(3)} edge=${s.edge.toFixed(2)} tier=${s.tier}`,
        );
      }
      for (const s of pipelineRecorder.skips) {
        console.warn(
          `[mercados-pipeline] tryAdd_skip #${s.fixtureId} ${s.marketLabel} | ${s.reason}${s.detail ? ` | ${s.detail}` : ""}`,
        );
      }
    }

    warnings.push(
      `[pipeline] fixtures_dia=${fixturesResult.fixtures.length} oddsEvents=${allOddsEvents.length} matched_odds_real=${matched} forced_gt0_8=${kickoffForcedCount} semMatchOdds=${fixturesNoOddsMatch} semTrends=${fixturesOddsButNoTrends} tryAdds=${marketsTryAddInvoked} rows=${rowsBeforeSort} window_ms=${MATCH_TIME_WINDOW_MS}`,
    );
    for (const s of oddsMatchOkSamples.slice(0, 2)) {
      warnings.push(`[pipeline] ${s}`);
    }
    for (const s of noTrendsSamples.slice(0, 2)) {
      warnings.push(`[pipeline] ${s}`);
    }
    if (pipelineRecorder && pipelineRecorder.skips.length > 0) {
      warnings.push(
        `[pipeline] primeiros skips tryAdd: ${pipelineRecorder.skips
          .slice(0, 4)
          .map((x) => `${x.marketLabel}:${x.reason}`)
          .join(" | ")}`,
      );
    }
  }

  const sorted = rows.sort((a, b) => b.ev - a.ev);
  const limited = sorted.slice(0, limit);

  console.warn("[EV PIPELINE] rows finais", rows.length);
  console.warn("[EV PIPELINE]", {
    fixturesTotal: fixturesResult.fixtures.length,
    fixturesMatched: matched,
    rowsGenerated: rows.length,
  });

  return {
    ok: true,
    rows: limited,
    meta: {
      date,
      fixturesTotal: fixturesResult.fixtures.length,
      fixturesMatched: matched,
      oddsEventsTotal: allOddsEvents.length,
      rowsBeforeLimit: sorted.length,
      sportKeys,
      warnings,
    },
  };
}

export function buildMarketAnalysisHref(row: MarketBoardRow): string {
  const params = new URLSearchParams({
    fixtureId: String(row.fixtureId),
    home: row.homeTeam,
    away: row.awayTeam,
    league: row.league,
    country: row.country,
    mercado: row.marketLabel,
    odd: String(row.marketOdd),
    probabilidade: String(row.realProbability),
    ev: String(row.ev),
  });
  return `/admin-editorial/nova?${params.toString()}`;
}
