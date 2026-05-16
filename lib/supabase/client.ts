import { createBrowserClient } from "@supabase/ssr";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (shouldSkipLiveSupabase()) {
    throw new Error(
      "Supabase indisponível no cliente: verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    },
  );

  return client;
}
