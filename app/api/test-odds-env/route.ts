import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function parseSportKeys(raw: string | undefined): string[] {
  return (raw ?? "")
    .trim()
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const oddsKey = process.env.ODDS_API_KEY;
  const sportKeys = process.env.MARKET_BOARD_SPORT_KEYS;

  return NextResponse.json(
    {
      hasOddsKey: Boolean(oddsKey),
      oddsKeyLength: oddsKey?.length,
      sportKeys,
      sportKeysParsed: parseSportKeys(sportKeys),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
