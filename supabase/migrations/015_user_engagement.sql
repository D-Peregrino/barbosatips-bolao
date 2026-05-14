-- Favoritos, seguimentos e notificações in-app (retenção).
-- Push / e-mail / Telegram: canais em user_notification_preferences (futuro).

CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('analise', 'pick')),
  ref_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref_id)
);

CREATE INDEX user_favorites_user_idx ON public.user_favorites (user_id, created_at DESC);

CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('esporte', 'campeonato', 'tipster')),
  ref_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref_key)
);

CREATE INDEX user_follows_user_idx ON public.user_follows (user_id, created_at DESC);

CREATE TABLE public.user_notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  notify_new_analise boolean NOT NULL DEFAULT true,
  notify_new_pick boolean NOT NULL DEFAULT true,
  notify_pick_result boolean NOT NULL DEFAULT true,
  notify_hot_streak boolean NOT NULL DEFAULT true,
  channel_push boolean NOT NULL DEFAULT false,
  channel_email boolean NOT NULL DEFAULT false,
  channel_telegram boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  dedupe_key text NOT NULL,
  title text NOT NULL,
  body text,
  ref_type text,
  ref_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dedupe_key)
);

CREATE INDEX user_notifications_user_created_idx
  ON public.user_notifications (user_id, created_at DESC);

COMMENT ON TABLE public.user_favorites IS 'Favoritos: análises (slug) ou picks (id UUID).';
COMMENT ON TABLE public.user_follows IS 'Seguir esporte (slug), campeonato (esporte/slug) ou tipster (slug).';
COMMENT ON TABLE public.user_notifications IS 'Feed in-app; dedupe_key evita spam. Canais externos preparados em prefs.';

-- RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_favorites_select_own ON public.user_favorites
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY user_favorites_insert_own ON public.user_favorites
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY user_favorites_delete_own ON public.user_favorites
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY user_follows_select_own ON public.user_follows
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY user_follows_insert_own ON public.user_follows
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY user_follows_delete_own ON public.user_follows
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY user_notif_prefs_select_own ON public.user_notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY user_notif_prefs_insert_own ON public.user_notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY user_notif_prefs_update_own ON public.user_notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_notifications_select_own ON public.user_notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY user_notifications_insert_own ON public.user_notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY user_notifications_update_own ON public.user_notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_notifications_delete_own ON public.user_notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());
