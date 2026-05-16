import { NextResponse } from "next/server";
import { fetchFixturesByDate, todayDateBrazil } from "@/lib/api-football/client";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 403 });
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
