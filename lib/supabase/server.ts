import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export function createClient() {
  if (shouldSkipLiveSupabase()) {
    throw new Error(
      "Supabase indisponível no servidor: credenciais ou URL não configuradas.",
    );
  }

  const cookieStore = cookies();
  console.warn("[SUPABASE SERVER CLIENT DEBUG]", {
    cookies: cookieStore.getAll().map((cookie) => ({
      name: cookie.name,
      length: cookie.value.length,
    })),
  });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components não podem setar cookies
            // O middleware cuida disso
          }
        },
      },
    },
  );
}

export function createAdminClient() {
  if (shouldSkipLiveSupabase()) {
    throw new Error(
      "createAdminClient indisponível: credenciais Supabase não configuradas neste ambiente.",
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false },
    },
  );
}
