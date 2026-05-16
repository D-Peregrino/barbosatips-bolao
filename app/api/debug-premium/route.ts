import { NextResponse } from "next/server";
import { getCurrentUser, isPremiumUser } from "@/lib/access/permissions";
import {
  entitlementIsActive,
  listEntitlementsForUser,
} from "@/lib/access/entitlements";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const authUser = await getCurrentUser();
  const entitlements = authUser ? await listEntitlementsForUser(authUser.id) : [];
  const premiumResult = authUser ? await isPremiumUser(authUser.id) : false;

  console.warn("[DEBUG PREMIUM API]", {
    authUser,
    entitlements: entitlements.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      entitlement: row.entitlement,
      status: row.status,
      starts_at: row.starts_at,
      expires_at: row.expires_at,
      active: entitlementIsActive(row),
    })),
    premiumResult,
  });

  return NextResponse.json(
    {
      shouldSkipLiveSupabase: shouldSkipLiveSupabase(),
      authUser,
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
      premiumResult,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
