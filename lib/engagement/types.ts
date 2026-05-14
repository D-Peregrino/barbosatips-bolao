export type FavoriteKind = "analise" | "pick";

export type FollowKind = "esporte" | "campeonato" | "tipster";

export type UserFavoriteRow = {
  id: string;
  kind: FavoriteKind;
  ref_id: string;
  created_at: string;
};

export type UserFollowRow = {
  id: string;
  kind: FollowKind;
  ref_key: string;
  created_at: string;
};

export type UserNotificationRow = {
  id: string;
  type: string;
  dedupe_key: string;
  title: string;
  body: string | null;
  ref_type: string | null;
  ref_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type UserNotificationPrefsRow = {
  user_id: string;
  notify_new_analise: boolean;
  notify_new_pick: boolean;
  notify_pick_result: boolean;
  notify_hot_streak: boolean;
  channel_push: boolean;
  channel_email: boolean;
  channel_telegram: boolean;
  last_sync_at: string | null;
  updated_at: string;
};

/** Campeonato: `esporteSlug/ligaSlug` (ex.: futebol/brasileirao-serie-a). */
export function campeonatoFollowKey(esporteSlug: string, leagueSlug: string): string {
  return `${esporteSlug.trim().toLowerCase()}/${leagueSlug.trim().toLowerCase()}`;
}
