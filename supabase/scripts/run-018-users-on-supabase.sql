-- ═══════════════════════════════════════════════════════════════════════════
-- BarbosaTips — Executar no Supabase: SQL Editor → New query → Run
-- (mesmo conteúdo que supabase/migrations/018_users_profiles_and_admin.sql)
-- Depois: supabase/scripts/promote-user-to-admin.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'tipster', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id                    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  username              TEXT NOT NULL,
  display_name          TEXT,
  avatar_url            TEXT,
  role                  public.user_role NOT NULL DEFAULT 'user',
  bio                   TEXT,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  is_subscriber_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT users_username_length CHECK (length(username) BETWEEN 3 AND 30);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_subscriber_premium BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_users_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := lower(
    regexp_replace(
      COALESCE(
        NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
        split_part(COALESCE(NEW.email, 'user'), '@', 1)
      ),
      '[^a-z0-9_]',
      '',
      'g'
    )
  );

  IF length(base_username) < 3 THEN
    base_username := 'user';
  END IF;

  final_username := left(base_username, 26);

  WHILE EXISTS (SELECT 1 FROM public.users u WHERE u.username = final_username) LOOP
    suffix := suffix + 1;
    final_username := left(base_username, 26) || suffix::TEXT;
  END LOOP;

  INSERT INTO public.users (id, email, username, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    final_username,
    NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'avatar_url'), ''),
    'user'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.users (id, email, username, avatar_url, role)
SELECT
  a.id,
  COALESCE(a.email, ''),
  left(
    CASE
      WHEN length(regexp_replace(lower(split_part(COALESCE(a.email, 'user'), '@', 1)), '[^a-z0-9_]', '', 'g')) >= 3
        THEN regexp_replace(lower(split_part(COALESCE(a.email, 'user'), '@', 1)), '[^a-z0-9_]', '', 'g')
      ELSE 'user' || substr(replace(a.id::TEXT, '-', ''), 1, 8)
    END,
    30
  ),
  a.raw_user_meta_data->>'avatar_url',
  'user'::public.user_role
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = a.id)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_public" ON public.users;
CREATE POLICY "users_select_public" ON public.users FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
