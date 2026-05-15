import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const SPORTS_URL = "https://api.the-odds-api.com/v4/sports/";

type RawSport = {
  key?: string;
  title?: string;
  active?: boolean;
};

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY?.trim() ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ODDS_API_KEY ausente" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = `${SPORTS_URL}?apiKey=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      {
        ok: false,
        status: res.status,
        error: text.slice(0, 500) || res.statusText,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const raw = (await res.json()) as unknown;
  const rows = Array.isArray(raw) ? raw : [];

  const sports = (rows as RawSport[]).map((s) => ({
    key: typeof s.key === "string" ? s.key : "",
    title: typeof s.title === "string" ? s.title : "",
    active: Boolean(s.active),
  }));

  return NextResponse.json(
    { ok: true, count: sports.length, sports },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
