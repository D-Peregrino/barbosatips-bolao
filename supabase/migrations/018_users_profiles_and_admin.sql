-- ═══════════════════════════════════════════════════════════════════════════
-- BarbosaTips — public.users (perfis + role admin)
-- Idempotente: seguro se 001_initial_schema já correu ou se a tabela não existir.
-- O painel /admin usa: SELECT role FROM public.users WHERE id = auth.uid()
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enum de papéis ─────────────────────────────────────────────────────────
DO $$
BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'tipster', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Tabela public.users ────────────────────────────────────────────────────
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

-- Constraints (ignorar se já existirem)
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

-- Colunas adicionadas em migrações posteriores (projeto actual)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_subscriber_premium BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON TABLE public.users IS 'Perfil público sincronizado com auth.users; role=admin libera /admin.';
COMMENT ON COLUMN public.users.role IS 'user | tipster | admin — painel central exige admin.';
COMMENT ON COLUMN public.users.is_subscriber_premium IS 'Acesso a conteúdo premium (analises/picks is_premium).';

-- ─── updated_at ─────────────────────────────────────────────────────────────
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

-- ─── Sincronizar auth.users → public.users (novos registos) ─────────────────
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
    SET
      email = EXCLUDED.email,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Backfill: utilizadores já existentes em auth.users ─────────────────────
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

-- Resolver usernames duplicados do backfill (sufixo numérico)
DO $$
DECLARE
  r RECORD;
  new_name TEXT;
  n INT;
BEGIN
  FOR r IN
    SELECT id, username
    FROM (
      SELECT id, username, COUNT(*) OVER (PARTITION BY username) AS c
      FROM public.users
    ) t
    WHERE c > 1
  LOOP
    n := 1;
    LOOP
      new_name := left(r.username, 26) || n::TEXT;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users u WHERE u.username = new_name AND u.id <> r.id);
      n := n + 1;
    END LOOP;
    UPDATE public.users SET username = new_name WHERE id = r.id;
  END LOOP;
END $$;

-- ─── RLS (leitura do próprio role para /admin) ──────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_public" ON public.users;
CREATE POLICY "users_select_public"
  ON public.users
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role / migrações ignoram RLS; clientes autenticados leem role via SELECT público.

GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
