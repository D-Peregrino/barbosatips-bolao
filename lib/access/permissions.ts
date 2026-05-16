import { createClient } from "@/lib/supabase/server";
import { STORE_PRODUCT_TO_ENTITLEMENT } from "@/lib/access/entitlement-types";
import { fetchAdminProfileRole, isAdminDbRole } from "@/lib/admin/supabase-admin";
import { userHasActiveEntitlement } from "@/lib/access/entitlements";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export type StoreProductId = "discord-ouvinte" | "bot-barbosa" | "discord-voz";

type CurrentUser = {
  id: string;
  email: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
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

export async function isPremiumUser(userId?: string): Promise<boolean> {
  const id = userId?.trim();
  if (id) return userHasActiveEntitlement(id, "vip_premium");

  const user = await getCurrentUser();
  if (!user) return false;
  return userHasActiveEntitlement(user.id, "vip_premium");
}

export async function hasBolaoAccess(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return userHasActiveEntitlement(user.id, "bolao_copa");
}

export async function hasStoreProductAccess(productId: StoreProductId): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return userHasActiveEntitlement(user.id, STORE_PRODUCT_TO_ENTITLEMENT[productId]);
}
