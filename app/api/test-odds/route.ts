import { NextResponse } from "next/server";
import {
  THE_ODDS_API_DEFAULTS,
  extractMainOddsLines,
  fetchFirstSportEvent,
  getBookmakers,
  getMarkets,
  getOddsApiKey,
  getOddsByFixture,
} from "@/services/the-odds-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!getOddsApiKey()) {
    return NextResponse.json(
      { ok: false, error: "ODDS_API_KEY ausente" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const sportKey =
    searchParams.get("sport")?.trim() || THE_ODDS_API_DEFAULTS.testSportKey;
  const eventIdParam = searchParams.get("eventId")?.trim() || null;

  try {
    let eventId = eventIdParam;
    let usage = {
      requestsRemaining: null as number | null,
      requestsUsed: null as number | null,
      requestsLast: null as number | null,
    };

    let fixtureResult;
    if (eventId) {
      fixtureResult = await getOddsByFixture({ sportKey, eventId });
    } else {
      fixtureResult = await fetchFirstSportEvent(sportKey);
      if (fixtureResult.ok) eventId = fixtureResult.data.id;
    }

    if (!fixtureResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: fixtureResult.error,
          sportKey,
        },
        {
          status: fixtureResult.status ?? 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    eventId = fixtureResult.data.id;
    usage = fixtureResult.usage;

    const [marketsResult, bookmakersResult] = await Promise.all([
      getMarkets({ sportKey, eventId }),
      getBookmakers({ sportKey, eventId }),
    ]);

    const event = fixtureResult.data;
    const mainOdds = extractMainOddsLines(event);

    const marketKeys = new Set<string>();
    for (const bm of event.bookmakers) {
      for (const m of bm.markets) marketKeys.add(m.key);
    }
    if (marketsResult.ok) {
      for (const bm of marketsResult.data.bookmakers) {
        for (const m of bm.markets) marketKeys.add(m.key);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        sportKey,
        event: {
          id: event.id,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          commenceTime: event.commenceTime,
          sportTitle: event.sportTitle,
        },
        casas: bookmakersResult.ok
          ? bookmakersResult.data.map((b) => ({
              key: b.key,
              title: b.title,
              lastUpdate: b.lastUpdate,
            }))
          : event.bookmakers.map((b) => ({
              key: b.key,
              title: b.title,
              lastUpdate: b.lastUpdate,
            })),
        mercados: Array.from(marketKeys).sort(),
        mercadosPorCasa: marketsResult.ok ? marketsResult.data.bookmakers : null,
        oddsPrincipais: {
          bookmakersCount: event.bookmakers.length,
          marketKeys: Array.from(marketKeys),
        },
        moneyline: mainOdds.moneyline.slice(0, 5),
        overUnder: mainOdds.overUnder.slice(0, 5),
        spreads: mainOdds.spreads.slice(0, 3),
        usage,
        bookmakersError: bookmakersResult.ok ? null : bookmakersResult.error,
        marketsError: marketsResult.ok ? null : marketsResult.error,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, error: message, sportKey },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
