import { createClient } from "@/lib/supabase/server";
import { STORE_PRODUCT_TO_ENTITLEMENT } from "@/lib/access/entitlement-types";
import { fetchAdminProfileRole, isAdminDbRole } from "@/lib/admin/supabase-admin";
import { userHasActiveEntitlement } from "@/lib/access/entitlements";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { cookies } from "next/headers";

export type StoreProductId = "discord-ouvinte" | "bot-barbosa" | "discord-voz";

type CurrentUser = {
  id: string;
  email: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (shouldSkipLiveSupabase()) {
    console.warn("[PREMIUM AUTH DEBUG]", {
      stage: "getCurrentUser",
      reason: "shouldSkipLiveSupabase",
    });
    return null;
  }

  try {
    const cookieList = cookies().getAll();
    console.warn("[PREMIUM AUTH COOKIES DEBUG]", {
      cookies: cookieList.map((cookie) => ({
        name: cookie.name,
        length: cookie.value.length,
      })),
    });

    const supabase = createClient();
    const sessionResult = await supabase.auth.getSession();
    const sessionUser = sessionResult.data.session?.user ?? null;
    console.warn("[PREMIUM AUTH SESSION DEBUG]", {
      getSession: {
        userId: sessionUser?.id ?? null,
        email: sessionUser?.email ?? null,
        error: sessionResult.error?.message ?? null,
        expiresAt: sessionResult.data.session?.expires_at ?? null,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.warn("[PREMIUM AUTH DEBUG]", {
      stage: "getCurrentUser",
      userId: user?.id ?? null,
      email: user?.email ?? null,
      error: userError?.message ?? null,
    });

    if (!user) return null;
    return { id: user.id, email: user.email ?? null };
  } catch (error) {
    console.warn("[PREMIUM AUTH DEBUG]", {
      stage: "getCurrentUser",
      error: error instanceof Error ? error.message : String(error),
    });
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
  if (id) {
    const result = await userHasActiveEntitlement(id, "vip_premium");
    console.warn("[IS PREMIUM DEBUG]", {
      source: "explicit_user_id",
      userId: id,
      premiumResult: result,
    });
    return result;
  }

  const user = await getCurrentUser();
  if (!user) {
    console.warn("[IS PREMIUM DEBUG]", {
      source: "session",
      authUser: null,
      premiumResult: false,
    });
    return false;
  }

  const result = await userHasActiveEntitlement(user.id, "vip_premium");
  console.warn("[IS PREMIUM DEBUG]", {
    source: "session",
    authUser: user,
    premiumResult: result,
  });
  return result;
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
