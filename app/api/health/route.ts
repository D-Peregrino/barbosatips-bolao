import { NextResponse } from "next/server";
import { getHealthSnapshot } from "@/lib/ops/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await getHealthSnapshot();
  return NextResponse.json(snapshot, {
    status: snapshot.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
