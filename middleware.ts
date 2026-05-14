import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  verifyAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";
import { sanitizeInternalRedirect } from "@/lib/auth/sanitize-internal-redirect";
import { applyAdminSecurityHeaders } from "@/lib/middleware/admin-security-headers";
import {
  isAdminAnalisesPublicLoginPath,
  isSupabaseAdminControlledPath,
} from "@/lib/middleware/supabase-admin-path";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

const PROTECTED_ROUTES = ["/dashboard", "/meu-feed"];

const AUTH_ROUTES = ["/login", "/registro"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const returnPath = `${path}${request.nextUrl.search || ""}`;

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

  /** Página de acesso negado — pública; noindex via metadata/headers. */
  if (path === "/acesso-negado" || path.startsWith("/acesso-negado/")) {
    return NextResponse.next();
  }

  if (path.startsWith("/admin/bolao")) {
    if (path.startsWith("/admin/bolao/login")) {
      return applyAdminSecurityHeaders(NextResponse.next());
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
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  /** `/admin/analises` — sessão por cookie (senha editorial); login público. */
  if (path.startsWith("/admin/analises")) {
    if (isAdminAnalisesPublicLoginPath(path)) {
      return applyAdminSecurityHeaders(NextResponse.next());
    }
    const secret = adminAnalisesSessionSecret();
    if (!secret) {
      return NextResponse.redirect(
        new URL("/admin/analises/login?erro=config", request.url),
      );
    }
    const token = request.cookies.get(ADMIN_ANALISES_COOKIE)?.value;
    if (!(await verifyAdminAnalisesCookieValue(token, secret))) {
      const loginUrl = new URL("/admin/analises/login", request.url);
      loginUrl.searchParams.set(
        "redirect",
        sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/admin/analises"),
      );
      return NextResponse.redirect(loginUrl);
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  const needsSupabaseAdmin = isSupabaseAdminControlledPath(path);

  if (needsSupabaseAdmin && shouldSkipLiveSupabase()) {
    return NextResponse.redirect(
      new URL("/acesso-negado?motivo=config", request.url),
    );
  }

  /** Dashboard operacional interno — sem auth; usar só em ambiente confiável. */
  if (path.startsWith("/operacional")) {
    return NextResponse.next();
  }

  /** Central de inteligência esportiva — público; sem auth no middleware. */
  if (path.startsWith("/inteligencia")) {
    return NextResponse.next();
  }

  /** Analytics / inteligência — mesmo modelo (sem login). */
  if (path.startsWith("/analytics")) {
    return NextResponse.next();
  }

  /** Health read-only — sem sessão Supabase no middleware. */
  if (path === "/api/health" || path.startsWith("/api/health/")) {
    return NextResponse.next();
  }

  /** Status humano (noindex) — sem auth. */
  if (path === "/status" || path.startsWith("/status/")) {
    return NextResponse.next();
  }

  if (!needsSupabaseAdmin && shouldSkipLiveSupabase()) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsSupabaseAdmin) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set(
        "redirect",
        sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/meu-feed"),
      );
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(
        new URL("/acesso-negado?motivo=permissao", request.url),
      );
    }

    return applyAdminSecurityHeaders(supabaseResponse);
  }

  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set(
      "redirect",
      sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/meu-feed"),
    );
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)",
  ],
};
