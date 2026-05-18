import { NextResponse } from "next/server";
import { canViewPremiumPicks, getCurrentUser, isAdminUser } from "@/lib/access/permissions";
import { listarQuickPicks, QUICK_PICKS_SELECT_COLUMNS } from "@/lib/picks/queries";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function summarizePick(row: Record<string, unknown>) {
  return {
    id: row.id,
    jogo: row.jogo,
    mercado: row.mercado,
    status: row.status,
    resultado: row.resultado,
    is_premium: row.is_premium,
    horario_jogo: row.horario_jogo,
    created_at: row.created_at,
  };
}

export async function GET() {
  const authUser = await getCurrentUser();
  const [isAdmin, canView, picksForAdmin, picksForVisitor] = await Promise.all([
    authUser ? isAdminUser(authUser.id) : false,
    authUser ? canViewPremiumPicks(authUser.id) : false,
    listarQuickPicks(false),
    listarQuickPicks(true),
  ]);

  const response: Record<string, unknown> = {
    shouldSkipLiveSupabase: shouldSkipLiveSupabase(),
    authUser,
    isAdmin,
    canViewPremiumPicks: canView,
    query: {
      table: "quick_picks",
      select: QUICK_PICKS_SELECT_COLUMNS,
      order: "horario_jogo desc",
      limit: 500,
      adminFilters: { soGratis: false },
      visitorFilters: { soGratis: true, excludePremiumInMemory: true },
    },
    returnedForAdmin: {
      total: picksForAdmin.length,
      premium: picksForAdmin.filter((pick) => pick.is_premium).length,
      sample: picksForAdmin.slice(0, 10),
    },
    returnedForVisitor: {
      total: picksForVisitor.length,
      premium: picksForVisitor.filter((pick) => pick.is_premium).length,
      sample: picksForVisitor.slice(0, 10),
    },
  };

  if (!shouldSkipLiveSupabase()) {
    try {
      const admin = createAdminClient();
      const [totalResult, premiumResult, rawResult] = await Promise.all([
        admin.from("quick_picks").select("id", { count: "exact", head: true }),
        admin
          .from("quick_picks")
          .select("id", { count: "exact", head: true })
          .eq("is_premium", true),
        admin
          .from("quick_picks")
          .select("*")
          .order("horario_jogo", { ascending: false })
          .limit(10),
      ]);

      response.database = {
        totalPicks: totalResult.count ?? 0,
        totalError: totalResult.error?.message ?? null,
        premiumPicks: premiumResult.count ?? 0,
        premiumError: premiumResult.error?.message ?? null,
        rawSample: (rawResult.data ?? []).map((row) =>
          summarizePick(row as Record<string, unknown>),
        ),
        rawError: rawResult.error?.message ?? null,
      };
    } catch (error) {
      response.database = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
