import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || null;
}

function fallbackRedirect(): string {
  return siteConfig.url || "/";
}

function safeDestination(value: unknown): string {
  const destination = String(value ?? "").trim();
  return /^https?:\/\//i.test(destination) ? destination : fallbackRedirect();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const bannerId = String(params.id ?? "").trim();
  if (!bannerId) return NextResponse.redirect(fallbackRedirect(), 302);

  const admin = createAdminClient();
  const { data: banner } = await admin
    .from("banners_publicitarios")
    .select("id,link_destino,ativo")
    .eq("id", bannerId)
    .maybeSingle();

  const destination = safeDestination((banner as { link_destino?: unknown } | null)?.link_destino);
  const response = NextResponse.redirect(destination, 302);
  const sessionCookie = request.cookies.get("bt_banner_session")?.value;
  const sessionId = sessionCookie || crypto.randomUUID();

  if (!sessionCookie) {
    response.cookies.set("bt_banner_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 180,
      path: "/",
    });
  }

  if (banner && (banner as { ativo?: unknown }).ativo !== false) {
    await admin.from("banner_clicks").insert({
      banner_id: bannerId,
      ip: clientIp(request),
      user_agent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      session_id: sessionId,
    });
    await admin.rpc("increment_banner_click_count", { p_banner_id: bannerId });
  }

  return response;
}
