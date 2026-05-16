import { NextResponse } from "next/server";
import { fetchFixturesByDate, todayDateBrazil } from "@/lib/api-football/client";
import { isPremiumUser } from "@/lib/access/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const allowed = await isPremiumUser();
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Acesso VIP Premium necessário." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date")?.trim() || todayDateBrazil();
  const result = await fetchFixturesByDate(date);

  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.error === "API_FOOTBALL_KEY ausente" ? 503 : 502,
    });
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
