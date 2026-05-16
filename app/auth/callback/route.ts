import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sanitizeInternalRedirect } from "@/lib/auth/sanitize-internal-redirect";

/**
 * Supabase Auth — troca de código OAuth/magic link por sessão em cookie.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = sanitizeInternalRedirect(
    url.searchParams.get("next"),
    url.origin,
    "/acesso",
  );

  const cookieStore = cookies();
  const res = NextResponse.redirect(new URL(next, url.origin));
  console.warn("[SUPABASE CALLBACK DEBUG]", {
    stage: "start",
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type,
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

  if (!code && !tokenHash) {
    console.warn("[SUPABASE CALLBACK DEBUG]", {
      stage: "missing_code",
      next,
    });
    return NextResponse.redirect(new URL("/entrar?erro=callback", url.origin));
  }

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: type === "signup" ? "signup" : "magiclink",
      });

  if (error) {
    console.warn("[SUPABASE CALLBACK DEBUG]", {
      stage: "exchange_error",
      error: error.message,
    });
    return NextResponse.redirect(new URL("/entrar?erro=callback", url.origin));
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

  if (!userResult.data.user) {
    return NextResponse.redirect(new URL("/entrar?erro=callback", url.origin));
  }

  return res;
}
