import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (shouldSkipLiveSupabase()) {
    return NextResponse.json({
      row: null,
      keys: [],
      error: "Supabase não configurado neste ambiente.",
    });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("analises").select("*").limit(1);
  const row = data?.[0] ?? null;

  return NextResponse.json({
    row,
    keys: row ? Object.keys(row) : [],
    error: error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      : null,
  });
}
