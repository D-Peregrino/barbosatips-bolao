import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { PremiumAccess } from "@/lib/premium/types";

const anon: PremiumAccess = {
  isLoggedIn: false,
  isSubscriberPremium: false,
};

/**
 * Lê sessão Supabase + flag `users.is_subscriber_premium`.
 * Sem Supabase ou em erro → anónimo (não assinante).
 */
export async function getPremiumAccess(): Promise<PremiumAccess> {
  if (shouldSkipLiveSupabase()) return anon;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return anon;

    const { data: profile, error } = await supabase
      .from("users")
      .select("is_subscriber_premium")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("getPremiumAccess users", error.message);
      return { isLoggedIn: true, isSubscriberPremium: false };
    }

    const row = profile as { is_subscriber_premium?: boolean } | null;
    return {
      isLoggedIn: true,
      isSubscriberPremium: Boolean(row?.is_subscriber_premium),
    };
  } catch (e) {
    console.warn("getPremiumAccess", e);
    return anon;
  }
}
