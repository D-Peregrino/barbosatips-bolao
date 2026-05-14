"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { FavoriteKind, FollowKind } from "@/lib/engagement/types";

function revalidateEngagement() {
  revalidatePath("/meu-feed");
  revalidatePath("/dashboard");
}

export async function toggleFavorite(kind: FavoriteKind, refId: string) {
  if (shouldSkipLiveSupabase()) return { ok: false as const, error: "offline" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "auth" };
  const id = String(refId ?? "").trim();
  if (!id) return { ok: false as const, error: "invalid" };

  const { data: existing } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .eq("ref_id", id)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("user_favorites").delete().eq("id", existing.id);
    revalidateEngagement();
    return { ok: true as const, favorited: false };
  }

  const { error } = await supabase.from("user_favorites").insert({
    user_id: user.id,
    kind,
    ref_id: id,
  });
  if (error) {
    console.error("toggleFavorite", error);
    return { ok: false as const, error: "db" };
  }
  revalidateEngagement();
  return { ok: true as const, favorited: true };
}

export async function toggleFollow(kind: FollowKind, refKey: string) {
  if (shouldSkipLiveSupabase()) return { ok: false as const, error: "offline" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "auth" };
  const key = String(refKey ?? "").trim().toLowerCase();
  if (!key) return { ok: false as const, error: "invalid" };

  const { data: existing } = await supabase
    .from("user_follows")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .eq("ref_key", key)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("user_follows").delete().eq("id", existing.id);
    revalidateEngagement();
    return { ok: true as const, following: false };
  }

  const { error } = await supabase.from("user_follows").insert({
    user_id: user.id,
    kind,
    ref_key: key,
  });
  if (error) {
    console.error("toggleFollow", error);
    return { ok: false as const, error: "db" };
  }
  revalidateEngagement();
  return { ok: true as const, following: true };
}

export async function markNotificationRead(id: string) {
  if (shouldSkipLiveSupabase()) return { ok: false as const };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidateEngagement();
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  if (shouldSkipLiveSupabase()) return { ok: false as const };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  const now = new Date().toISOString();
  await supabase.from("user_notifications").update({ read_at: now }).eq("user_id", user.id).is("read_at", null);
  revalidateEngagement();
  return { ok: true as const };
}

export async function updateNotificationPrefs(input: {
  notify_new_analise?: boolean;
  notify_new_pick?: boolean;
  notify_pick_result?: boolean;
  notify_hot_streak?: boolean;
  channel_push?: boolean;
  channel_email?: boolean;
  channel_telegram?: boolean;
}) {
  if (shouldSkipLiveSupabase()) return { ok: false as const };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  const patch = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_notification_preferences")
    .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" });

  if (error) {
    console.error("updateNotificationPrefs", error);
    return { ok: false as const };
  }
  revalidateEngagement();
  return { ok: true as const };
}

export async function getEngagementSnapshot() {
  if (shouldSkipLiveSupabase()) {
    return {
      userId: null as string | null,
      favoriteSlugs: [] as string[],
      favoritePickIds: [] as string[],
      followKeys: [] as { kind: FollowKind; ref_key: string }[],
      unreadNotifications: 0,
    };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      userId: null,
      favoriteSlugs: [],
      favoritePickIds: [],
      followKeys: [],
      unreadNotifications: 0,
    };
  }

  const [{ data: favs }, { data: flw }, unreadRes] = await Promise.all([
    supabase.from("user_favorites").select("kind,ref_id").eq("user_id", user.id),
    supabase.from("user_follows").select("kind,ref_key").eq("user_id", user.id),
    supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  const favoriteSlugs = (favs ?? []).filter((r) => r.kind === "analise").map((r) => r.ref_id);
  const favoritePickIds = (favs ?? []).filter((r) => r.kind === "pick").map((r) => r.ref_id);
  const followKeys = (flw ?? []).map((r) => ({ kind: r.kind as FollowKind, ref_key: r.ref_key }));

  return {
    userId: user.id,
    favoriteSlugs,
    favoritePickIds,
    followKeys,
    unreadNotifications: unreadRes.count ?? 0,
  };
}
