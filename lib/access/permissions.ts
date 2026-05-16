import { createClient } from "@/lib/supabase/server";
import { fetchAdminProfileRole, isAdminDbRole } from "@/lib/admin/supabase-admin";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export type StoreProductId = "discord-ouvinte" | "bot-barbosa" | "discord-voz";

type CurrentUser = {
  id: string;
  email: string | null;
};

async function getCurrentUser(): Promise<CurrentUser | null> {
  if (shouldSkipLiveSupabase()) return null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

export async function isAdminUser(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { role, error } = await fetchAdminProfileRole(user.id);
  if (error) return false;
  return isAdminDbRole(role);
}

export async function isPremiumUser(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  if (await isAdminUser()) return true;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("is_subscriber_premium")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return false;
    return Boolean((data as { is_subscriber_premium?: boolean } | null)?.is_subscriber_premium);
  } catch {
    return false;
  }
}

export async function hasBolaoAccess(): Promise<boolean> {
  // O bolão mantém fluxo próprio por inscrição/login separado do Supabase Auth.
  return false;
}

export async function hasStoreProductAccess(productId: StoreProductId): Promise<boolean> {
  void productId;
  // Produtos da loja serão liberados por compra individual quando o checkout existir.
  return false;
}
