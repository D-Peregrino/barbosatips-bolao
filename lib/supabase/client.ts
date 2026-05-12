import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseMock } from "@/lib/supabase/is-mock";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (isSupabaseMock()) {
    throw new Error(
      "Supabase desativado (modo demonstração). Não chame createClient() no cliente.",
    );
  }

  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
}
