import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseMock } from "@/lib/supabase/is-mock";

export function createClient() {
  if (isSupabaseMock()) {
    throw new Error(
      "Supabase desativado (modo demonstração). Os serviços usam dados mock em lib/mock-data.ts.",
    );
  }

  const cookieStore = cookies();

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
  if (isSupabaseMock()) {
    throw new Error("createAdminClient não está disponível em modo demonstração.");
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
