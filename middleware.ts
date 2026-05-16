import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";
import { isUserAdmin } from "@/lib/admin/supabase-admin";
import { sanitizeInternalRedirect } from "@/lib/auth/sanitize-internal-redirect";
import { applyAdminSecurityHeaders } from "@/lib/middleware/admin-security-headers";
import { requiresAdminPanelSession } from "@/lib/middleware/admin-panel-path";
import {
  createSupabaseMiddlewareClient,
  redirectPreservingSupabaseCookies,
} from "@/lib/supabase/middleware-client";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

const PROTECTED_ROUTES = ["/dashboard", "/meu-feed"];
const CLIENT_AUTH_ROUTES = ["/picks", "/vip/central-ev", "/vip/football-insights"];

const AUTH_ROUTES = ["/login", "/entrar"];

const SIGNUP_REDIRECT_PREFIXES = ["/registro", "/signup", "/register"] as const;

function isSignupPath(pathname: string): boolean {
  return SIGNUP_REDIRECT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type MiddlewareSupabaseClient = ReturnType<typeof createSupabaseMiddlewareClient>["supabase"];

async function getMiddlewareAuthUser(
  supabase: MiddlewareSupabaseClient,
  request: NextRequest,
  stage: string,
) {
  const sessionResult = await supabase.auth.getSession();
  const userResult = await supabase.auth.getUser();
  const sessionUser = sessionResult.data.session?.user ?? null;
  const authUser = userResult.data.user ?? null;

  console.warn("[SUPABASE MIDDLEWARE AUTH DEBUG]", {
    stage,
    path: request.nextUrl.pathname,
    cookies: request.cookies.getAll().map((cookie) => ({
      name: cookie.name,
      length: cookie.value.length,
    })),
    getSession: {
      userId: sessionUser?.id ?? null,
      email: sessionUser?.email ?? null,
      error: sessionResult.error?.message ?? null,
      expiresAt: sessionResult.data.session?.expires_at ?? null,
    },
    getUser: {
      userId: authUser?.id ?? null,
      email: authUser?.email ?? null,
      error: userResult.error?.message ?? null,
    },
  });

  return authUser;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const returnPath = `${path}${request.nextUrl.search || ""}`;

  if (isSignupPath(path)) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

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

  if (siteConfig.betaLaunch.enabled) {
    for (const prefix of siteConfig.betaLaunch.redirectToHomePrefixes) {
      if (path === prefix || path.startsWith(`${prefix}/`)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
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

  const isAdminLoginPath = path === "/admin/login" || path.startsWith("/admin/login/");

  if (isAdminLoginPath) {
    if (shouldSkipLiveSupabase()) {
      return applyAdminSecurityHeaders(NextResponse.next());
    }
    const { supabase, getResponse } = createSupabaseMiddlewareClient(request);
    const user = await getMiddlewareAuthUser(supabase, request, "admin_login");
    const res = getResponse();
    if (user) {
      const isAdmin = await isUserAdmin(supabase, user.id);
      const target = isAdmin
        ? new URL("/admin", request.url)
        : new URL("/acesso-negado", request.url);
      if (!isAdmin) target.searchParams.set("motivo", "permissao");
      return applyAdminSecurityHeaders(
        redirectPreservingSupabaseCookies(request, target, res),
      );
    }
    return applyAdminSecurityHeaders(res);
  }

  /** Login editorial antigo → painel central. */
  if (path === "/admin/analises/login" || path.startsWith("/admin/analises/login/")) {
    const u = new URL("/admin/login", request.url);
    u.searchParams.set("redirect", "/admin/analises");
    return NextResponse.redirect(u);
  }

  const panelNeeded = requiresAdminPanelSession(path);

  if (panelNeeded) {
    if (shouldSkipLiveSupabase()) {
      return NextResponse.redirect(
        new URL("/admin/login?erro=config", request.url),
      );
    }
    const { supabase, getResponse } = createSupabaseMiddlewareClient(request);
    const user = await getMiddlewareAuthUser(supabase, request, "admin_panel");
    let res = getResponse();

    if (!user) {
      const u = new URL("/admin/login", request.url);
      u.searchParams.set(
        "redirect",
        sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/admin"),
      );
      return applyAdminSecurityHeaders(
        redirectPreservingSupabaseCookies(request, u, res),
      );
    }

    if (!(await isUserAdmin(supabase, user.id))) {
      const u = new URL("/acesso-negado", request.url);
      u.searchParams.set("motivo", "permissao");
      return applyAdminSecurityHeaders(
        redirectPreservingSupabaseCookies(request, u, res),
      );
    }

    return applyAdminSecurityHeaders(res);
  }

  if (path === "/api/health" || path.startsWith("/api/health/")) {
    return NextResponse.next();
  }

  if (path === "/api/test-football" || path.startsWith("/api/test-football/")) {
    return NextResponse.next();
  }

  if (path === "/api/test-odds" || path.startsWith("/api/test-odds/")) {
    return NextResponse.next();
  }

  if (path === "/api/test-ev" || path.startsWith("/api/test-ev/")) {
    return NextResponse.next();
  }

  if (path === "/status" || path.startsWith("/status/")) {
    return NextResponse.next();
  }

  if (shouldSkipLiveSupabase()) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);

  const user = await getMiddlewareAuthUser(supabase, request, "default");

  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/entrar";
    redirectUrl.searchParams.set(
      "next",
      sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/meu-feed"),
    );
    return redirectPreservingSupabaseCookies(request, redirectUrl, getResponse());
  }

  const needsClientAuth = CLIENT_AUTH_ROUTES.some(
    (r) => path === r || path.startsWith(`${r}/`),
  );
  if (needsClientAuth && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/entrar";
    redirectUrl.searchParams.set(
      "next",
      sanitizeInternalRedirect(returnPath, request.nextUrl.origin, "/acesso"),
    );
    return redirectPreservingSupabaseCookies(request, redirectUrl, getResponse());
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    const target = sanitizeInternalRedirect(
      request.nextUrl.searchParams.get("next") ?? request.nextUrl.searchParams.get("redirect"),
      request.nextUrl.origin,
      "/acesso",
    );
    const targetUrl = new URL(target, request.nextUrl.origin);
    redirectUrl.pathname = targetUrl.pathname;
    redirectUrl.search = targetUrl.search;
    redirectUrl.hash = targetUrl.hash;
    return redirectPreservingSupabaseCookies(request, redirectUrl, getResponse());
  }

  return getResponse();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|patrocinadores|robots.txt|sitemap.xml).*)",
  ],
};
