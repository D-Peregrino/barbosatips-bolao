import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sanitizeInternalRedirect } from "@/lib/auth/sanitize-internal-redirect";

/**
 * OAuth Google — troca de código por sessão (Supabase).
 * Não altera o hook `useAuth`; apenas completa o redirect configurado lá.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitizeInternalRedirect(
    url.searchParams.get("next"),
    url.origin,
    "/meu-feed",
  );

  if (!code) {
    return NextResponse.redirect(new URL("/login?erro=oauth", url.origin));
  }

  const cookieStore = cookies();
  const res = NextResponse.redirect(new URL(next, url.origin));
  console.warn("[SUPABASE CALLBACK DEBUG]", {
    stage: "start",
    hasCode: Boolean(code),
    next,
    cookies: cookieStore.getAll().map((cookie) => ({
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
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          console.warn("[SUPABASE CALLBACK SET COOKIES DEBUG]", {
            cookies: cookiesToSet.map(({ name, value, options }) => ({
              name,
              length: value.length,
              path: options.path,
              maxAge: options.maxAge,
              sameSite: options.sameSite,
              secure: options.secure,
            })),
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn("[SUPABASE CALLBACK DEBUG]", {
      stage: "exchange_error",
      error: error.message,
    });
    return NextResponse.redirect(new URL(`/login?erro=${encodeURIComponent(error.message)}`, url.origin));
  }

  const sessionResult = await supabase.auth.getSession();
  const userResult = await supabase.auth.getUser();
  console.warn("[SUPABASE CALLBACK DEBUG]", {
    stage: "exchange_success",
    getSession: {
      userId: sessionResult.data.session?.user.id ?? null,
      email: sessionResult.data.session?.user.email ?? null,
      error: sessionResult.error?.message ?? null,
      expiresAt: sessionResult.data.session?.expires_at ?? null,
    },
    getUser: {
      userId: userResult.data.user?.id ?? null,
      email: userResult.data.user?.email ?? null,
      error: userResult.error?.message ?? null,
    },
  });

  return res;
}
