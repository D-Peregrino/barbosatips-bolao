import { NextResponse } from "next/server";
import { fetchFixtureById } from "@/lib/api-football/client";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: { id: string } };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdminActor();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 403 });
  }

  const fixtureId = Number(params.id);
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    return NextResponse.json({ ok: false, error: "ID de fixture inválido" }, { status: 400 });
  }

  const result = await fetchFixtureById(fixtureId);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.error === "API_FOOTBALL_KEY ausente" ? 503 : 404 },
    );
  }

  return NextResponse.json(
    { ok: true, fixture: result.fixture, raw: result.raw },
    { headers: { "Cache-Control": "no-store" } },
  );
}
