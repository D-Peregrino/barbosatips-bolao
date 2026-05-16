import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cookieList = cookies().getAll();
  const cookieSummary = cookieList.map((cookie) => ({
    name: cookie.name,
    length: cookie.value.length,
  }));
  const hasSbAccessToken = cookieList.some((cookie) => cookie.name === "sb-access-token");
  const hasSbRefreshToken = cookieList.some((cookie) => cookie.name === "sb-refresh-token");
  const hasSupabaseAuthCookie = cookieList.some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
  );

  if (shouldSkipLiveSupabase()) {
    return NextResponse.json(
      {
        shouldSkipLiveSupabase: true,
        cookies: cookieSummary,
        hasSbAccessToken,
        hasSbRefreshToken,
        hasSupabaseAuthCookie,
        getSession: null,
        getUser: null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabase = createClient();
    const sessionResult = await supabase.auth.getSession();
    const userResult = await supabase.auth.getUser();

    return NextResponse.json(
      {
        shouldSkipLiveSupabase: false,
        cookies: cookieSummary,
        hasSbAccessToken,
        hasSbRefreshToken,
        hasSupabaseAuthCookie,
        getSession: {
          hasSession: Boolean(sessionResult.data.session),
          userId: sessionResult.data.session?.user.id ?? null,
          email: sessionResult.data.session?.user.email ?? null,
          expiresAt: sessionResult.data.session?.expires_at ?? null,
          error: sessionResult.error?.message ?? null,
        },
        getUser: {
          userId: userResult.data.user?.id ?? null,
          email: userResult.data.user?.email ?? null,
          error: userResult.error?.message ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        shouldSkipLiveSupabase: false,
        cookies: cookieSummary,
        hasSbAccessToken,
        hasSbRefreshToken,
        hasSupabaseAuthCookie,
        getSession: null,
        getUser: null,
        error: error instanceof Error ? error.message : String(error),
      },
      { headers: { "Cache-Control": "no-store" }, status: 500 },
    );
  }
}
