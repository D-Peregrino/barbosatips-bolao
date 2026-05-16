import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Cliente Supabase em Edge (middleware) com refresh de cookies na resposta mutável.
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });
  console.warn("[SUPABASE MIDDLEWARE COOKIES DEBUG]", {
    path: request.nextUrl.pathname,
    cookies: request.cookies.getAll().map((cookie) => ({
      name: cookie.name,
      length: cookie.value.length,
    })),
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          console.warn("[SUPABASE MIDDLEWARE SET COOKIES DEBUG]", {
            path: request.nextUrl.pathname,
            cookies: cookiesToSet.map(({ name, value, options }) => ({
              name,
              length: value.length,
              path: options.path,
              maxAge: options.maxAge,
              sameSite: options.sameSite,
              secure: options.secure,
            })),
          });
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, getResponse: () => response };
}

/** Preserva cookies de sessão (ex.: refresh) ao redirecionar. */
export function redirectPreservingSupabaseCookies(
  request: NextRequest,
  target: URL,
  supabaseResponse: NextResponse,
) {
  const redirectRes = NextResponse.redirect(target);
  supabaseResponse.cookies.getAll().forEach((c) => {
    redirectRes.cookies.set(c);
  });
  return redirectRes;
}
