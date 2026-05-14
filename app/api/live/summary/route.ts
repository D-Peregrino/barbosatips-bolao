import { NextResponse } from "next/server";
import { loadLiveSummaryForViewer } from "@/lib/live/load-live-summary";

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
    console.error("GET /api/live/summary", e);
    return NextResponse.json(
      { error: "live_summary_failed" },
      { status: 500 },
    );
  }
}
