import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  canViewPremiumPicks,
  getCurrentUser,
  isAdminUser,
  isPremiumUser,
} from "@/lib/access/permissions";
import { entitlementIsActive, listEntitlementsForUser } from "@/lib/access/entitlements";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const authUser = await getCurrentUser();
  const [entitlements, isPremium, isAdmin, canView] = authUser
    ? await Promise.all([
        listEntitlementsForUser(authUser.id),
        isPremiumUser(authUser.id),
        isAdminUser(authUser.id),
        canViewPremiumPicks(authUser.id),
      ])
    : [[], false, false, false] as const;

  return NextResponse.json(
    {
      shouldSkipLiveSupabase: shouldSkipLiveSupabase(),
      authUser,
      isPremium,
      isAdmin,
      canViewPremiumPicks: canView,
      entitlements: entitlements.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        entitlement: row.entitlement,
        status: row.status,
        starts_at: row.starts_at,
        expires_at: row.expires_at,
        source: row.source,
        external_payment_id: row.external_payment_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        active: entitlementIsActive(row),
      })),
      cookies: cookies().getAll().map((cookie) => ({
        name: cookie.name,
        length: cookie.value.length,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
