import "server-only";

import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { listarAnalisesPorSlugs, listarAnalisesPublicadasPorEsporte } from "@/lib/analises/queries";
import { listarQuickPicksPorEsporte, listarQuickPicksPorIds } from "@/lib/picks/queries";
import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { syncUserNotificationsForUser } from "@/lib/engagement/sync-notifications";
import type {
  UserFavoriteRow,
  UserFollowRow,
  UserNotificationPrefsRow,
  UserNotificationRow,
} from "@/lib/engagement/types";

export type MeuFeedPayload = {
  userId: string | null;
  favorites: UserFavoriteRow[];
  follows: UserFollowRow[];
  prefs: UserNotificationPrefsRow | null;
  notifications: UserNotificationRow[];
  favoriteAnalises: AnaliseRow[];
  favoritePicks: QuickPickRow[];
  followedSportPicks: QuickPickRow[];
  followedAnalisesSample: AnaliseRow[];
};

const empty: MeuFeedPayload = {
  userId: null,
  favorites: [],
  follows: [],
  prefs: null,
  notifications: [],
  favoriteAnalises: [],
  favoritePicks: [],
  followedSportPicks: [],
  followedAnalisesSample: [],
};

export async function loadMeuFeedPayload(): Promise<MeuFeedPayload> {
  if (shouldSkipLiveSupabase()) return { ...empty };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ...empty };

    const [{ data: favs }, { data: flw }, { data: prefs0 }] = await Promise.all([
      supabase.from("user_favorites").select("id,kind,ref_id,created_at").eq("user_id", user.id),
      supabase.from("user_follows").select("id,kind,ref_key,created_at").eq("user_id", user.id),
      supabase.from("user_notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    let prefsRow = prefs0 as UserNotificationPrefsRow | null;
    if (!prefsRow) {
      await supabase.from("user_notification_preferences").upsert(
        { user_id: user.id },
        { onConflict: "user_id" },
      );
      const { data: p2 } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      prefsRow = p2 as UserNotificationPrefsRow | null;
    }

    const favorites = (favs ?? []) as UserFavoriteRow[];
    const follows = (flw ?? []) as UserFollowRow[];

    const favAnaSlugs = favorites.filter((f) => f.kind === "analise").map((f) => f.ref_id);
    const favPickIds = favorites.filter((f) => f.kind === "pick").map((f) => f.ref_id);

    const [favoriteAnalises, favoritePicks] = await Promise.all([
      listarAnalisesPorSlugs(favAnaSlugs, false),
      listarQuickPicksPorIds(favPickIds, false),
    ]);

    const sportFollows = follows.filter((f) => f.kind === "esporte").map((f) => f.ref_key);
    const followedSportPicks =
      sportFollows.length > 0
        ? (
            await Promise.all(sportFollows.map((s) => listarQuickPicksPorEsporte(s, false)))
          )
            .flat()
            .slice(0, 24)
        : [];

    const followedAnalisesSample =
      sportFollows.length > 0
        ? (
            await Promise.all(
              sportFollows.map((s) => listarAnalisesPublicadasPorEsporte(s, false).then((a) => a.slice(0, 6))),
            )
          )
            .flat()
            .slice(0, 18)
        : [];

    await syncUserNotificationsForUser(supabase, user.id, follows, favPickIds, prefsRow);

    const { data: notifs } = await supabase
      .from("user_notifications")
      .select("id,type,dedupe_key,title,body,ref_type,ref_id,metadata,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);

    return {
      userId: user.id,
      favorites,
      follows,
      prefs: prefsRow,
      notifications: (notifs ?? []) as UserNotificationRow[],
      favoriteAnalises,
      favoritePicks,
      followedSportPicks,
      followedAnalisesSample,
    };
  } catch (e) {
    console.error("loadMeuFeedPayload", e);
    return { ...empty };
  }
}
