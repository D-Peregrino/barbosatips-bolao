import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

const PROTECTED_ROUTES = ["/dashboard", "/meu-feed"];

const ADMIN_ROUTES = ["/admin"];

const AUTH_ROUTES = ["/login", "/registro"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/nba") {
    return NextResponse.redirect(new URL("/basquete/nba", request.url));
  }

  if (path.startsWith("/auth")) {
    return NextResponse.next();
  }

  /** Ranking público do bolão: sem Supabase Auth, sem redirect para login. */
  if (path === "/ranking" || path.startsWith("/ranking/")) {
    return NextResponse.next();
  }

  if (path.startsWith("/admin/bolao")) {
    if (path.startsWith("/admin/bolao/login")) {
      return NextResponse.next();
    }
    const secret = adminBolaoSessionSecret();
    if (!secret) {
      return NextResponse.redirect(
        new URL("/admin/bolao/login?erro=config", request.url),
      );
    }
    const token = request.cookies.get(ADMIN_BOLAO_COOKIE)?.value;
    if (!(await verifyAdminBolaoCookieValue(token, secret))) {
      return NextResponse.redirect(new URL("/admin/bolao/login", request.url));
    }
    return NextResponse.next();
  }

  /** Admin editorial desativado: sem Supabase Auth nem checagens neste prefixo. */
  if (path.startsWith("/admin/analises")) {
    return NextResponse.next();
  }

  /** CMS editorial isolado em /admin-editorial — sem auth nem Supabase no middleware. */
  if (path.startsWith("/admin-editorial")) {
    return NextResponse.next();
  }

  if (path.startsWith("/admin-leads")) {
    return NextResponse.next();
  }

  /** Admin picks rápidas — mesmo modelo que editorial (ambiente confiável). */
  if (path.startsWith("/admin-picks")) {
    return NextResponse.next();
  }

  if (shouldSkipLiveSupabase()) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    ADMIN_ROUTES.some((r) => path.startsWith(r)) &&
    !path.startsWith("/admin/bolao") &&
    !path.startsWith("/admin/analises") &&
    user
  ) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)",
  ],
};
