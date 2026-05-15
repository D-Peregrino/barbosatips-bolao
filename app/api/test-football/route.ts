import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const API_URL = "https://v3.football.api-sports.io/fixtures?live=all";

type ApiFootballFixture = {
  fixture?: {
    id?: number;
    date?: string;
    status?: { long?: string; short?: string };
  };
  league?: { name?: string; country?: string };
  teams?: {
    home?: { name?: string };
    away?: { name?: string };
  };
  goals?: { home?: number | null; away?: number | null };
};

function toFirstFixture(item: ApiFootballFixture | undefined) {
  if (!item) return null;
  return {
    id: item.fixture?.id ?? null,
    date: item.fixture?.date ?? null,
    status: item.fixture?.status?.long ?? item.fixture?.status?.short ?? null,
    league: item.league?.name ?? null,
    country: item.league?.country ?? null,
    home: item.teams?.home?.name ?? null,
    away: item.teams?.away?.name ?? null,
    goals: {
      home: item.goals?.home ?? null,
      away: item.goals?.away ?? null,
    },
  };
}

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "API_FOOTBALL_KEY ausente" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const res = await fetch(API_URL, {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    });

    const status = res.status;
    const body = (await res.json()) as {
      errors?: Record<string, string> | string[];
      results?: number;
      response?: ApiFootballFixture[];
    };

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          status,
          results: 0,
          firstFixture: null,
          error: "API-Football respondeu com erro HTTP",
          apiErrors: body.errors ?? null,
        },
        { status, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (body.errors && Object.keys(body.errors).length > 0) {
      return NextResponse.json(
        {
          ok: false,
          status,
          results: 0,
          firstFixture: null,
          error: "API-Football devolveu erros no payload",
          apiErrors: body.errors,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const fixtures = body.response ?? [];
    const results = typeof body.results === "number" ? body.results : fixtures.length;

    return NextResponse.json(
      {
        ok: true,
        status,
        results,
        firstFixture: toFirstFixture(fixtures[0]),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        results: 0,
        firstFixture: null,
        error: message,
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
