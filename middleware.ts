import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_PANEL_COOKIE,
  adminPanelSessionSecret,
  parseAdminPanelCookie,
  refreshAdminPanelCookieIfStale,
} from "@/lib/admin/panel-cookie";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";
import { sanitizeInternalRedirect } from "@/lib/auth/sanitize-internal-redirect";
import { applyAdminSecurityHeaders } from "@/lib/middleware/admin-security-headers";
import {
  requiresAdminPanelSession,
  shouldRedirectAdminRootToPanel,
} from "@/lib/middleware/admin-panel-path";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

const PROTECTED_ROUTES = ["/dashboard", "/meu-feed"];

const AUTH_ROUTES = ["/login", "/registro"];

const PANEL_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const returnPath = `${path}${request.nextUrl.search || ""}`;

  if (path === "/nba") {
    return NextResponse.redirect(new URL("/basquete/nba", request.url));
  }

  if (path.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (path === "/ranking" || path.startsWith("/ranking/")) {
    return NextResponse.next();
  }

  if (path === "/acesso-negado" || path.startsWith("/acesso-negado/")) {
    return NextResponse.next();
  }

  /** Bolão admin — fluxo e cookie existentes (inalterados). */
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

  /** Login central — se já autenticado, vai ao painel. */
  if (path === "/admin/login" || path.startsWith("/admin/login/")) {
    const secret = adminPanelSessionSecret();
    if (secret) {
      const tok = request.cookies.get(ADMIN_PANEL_COOKIE)?.value;
      if (await parseAdminPanelCookie(tok, secret)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  /** Login editorial antigo → painel central. */
  if (path === "/admin/analises/login" || path.startsWith("/admin/analises/login/")) {
    const u = new URL("/admin/login", request.url);
    u.searchParams.set("redirect", "/admin/analises");
    return NextResponse.redirect(u);
  }

  const panelNeeded = requiresAdminPanelSession(path);

  if (panelNeeded) {
    const secret = adminPanelSessionSecret();
    if (!secret) {
      return NextResponse.redirect(
        new URL("/admin/login?erro=config", request.url),
      );
    }
    const token = request.cookies.get(ADMIN_PANEL_COOKIE)?.value;
    const session = await parseAdminPanelCookie(token, secret);
    if (!session) {
      const u = new URL("/admin/login", request.url);
      u.searchParams.set(
        "redirect",
        sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/admin"),
      );
      return NextResponse.redirect(u);
    }

    if (shouldRedirectAdminRootToPanel(path)) {
      const u = new URL("/admin", request.url);
      if (path === "/admin-editorial") u.searchParams.set("mod", "editorial");
      if (path === "/admin-picks") u.searchParams.set("mod", "picks");
      if (path === "/admin-leads") u.searchParams.set("mod", "leads");
      return NextResponse.redirect(u);
    }

    const refreshed = await refreshAdminPanelCookieIfStale(token, secret);
    let res = NextResponse.next({ request });
    if (refreshed) {
      res.cookies.set(ADMIN_PANEL_COOKIE, refreshed, PANEL_COOKIE_OPTS);
    }
    return applyAdminSecurityHeaders(res);
  }

  if (path.startsWith("/operacional")) {
    return NextResponse.next();
  }

  if (path.startsWith("/inteligencia")) {
    return NextResponse.next();
  }

  if (path.startsWith("/analytics")) {
    return NextResponse.next();
  }

  if (path === "/api/health" || path.startsWith("/api/health/")) {
    return NextResponse.next();
  }

  if (path === "/status" || path.startsWith("/status/")) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
