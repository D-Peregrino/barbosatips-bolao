import { NextResponse } from "next/server";
import { loadLiveSummaryForViewer } from "@/lib/live/load-live-summary";
import { opsLogError } from "@/lib/ops/logger";

/**
 * Snapshot leve para polling (respeita sessão / filtro premium nas listagens).
 */
export async function GET() {
  try {
    const { summary } = await loadLiveSummaryForViewer();
    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "private, max-age=12, stale-while-revalidate=30",
      },
    });
  } catch (e) {
    opsLogError("api_live_summary", e, { route: "GET /api/live/summary" });
    return NextResponse.json(
      { error: "live_summary_failed" },
      { status: 500 },
    );
  }
}
