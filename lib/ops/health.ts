import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { withTimeout } from "@/lib/ops/safe-fetch";

export type HealthSnapshot = {
  ok: boolean;
  timestamp: string;
  checks: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    /** `null` = não testado (skip live ou falta env). */
    supabaseReachable: boolean | null;
  };
  build: {
    commit: string | null;
    env: string | null;
  };
};

async function pingSupabaseAuthHealth(
  baseUrl: string,
  anonKey: string,
): Promise<boolean> {
  const url = `${baseUrl.replace(/\/$/, "")}/auth/v1/health`;
  const res = await withTimeout(
    fetch(url, {
      method: "GET",
      headers: { apikey: anonKey },
      cache: "no-store",
    }),
    3500,
    "supabase_health",
  );
  return res.ok;
}

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const supabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const supabaseAnonKey = Boolean(anon);

  const skipLive = shouldSkipLiveSupabase();

  let supabaseReachable: boolean | null = null;
  if (!skipLive && supabaseUrl && supabaseAnonKey) {
    try {
      supabaseReachable = await pingSupabaseAuthHealth(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anon,
      );
    } catch {
      supabaseReachable = false;
    }
  }

  const okConfigured = supabaseUrl && supabaseAnonKey;
  const ok =
    okConfigured && (skipLive ? true : supabaseReachable === true);

  return {
    ok,
    timestamp: new Date().toISOString(),
    checks: {
      supabaseUrl,
      supabaseAnonKey,
      supabaseReachable: skipLive ? null : supabaseReachable,
    },
    build: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? null,
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null,
    },
  };
}
