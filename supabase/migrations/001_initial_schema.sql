-- ═══════════════════════════════════════════════════════════════════════════
-- BarbosaTips — Schema inicial
-- Execute: supabase db push
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca por texto

-- ─── TIPOS ENUM ──────────────────────────────────────────────────────────────
CREATE TYPE user_role     AS ENUM ('user', 'tipster', 'admin');
CREATE TYPE tip_result    AS ENUM ('win', 'loss', 'push', 'void', 'pending');
CREATE TYPE tip_status    AS ENUM ('draft', 'published', 'archived');
CREATE TYPE bolao_status  AS ENUM ('open', 'closed', 'finished');

-- ─── TABELA: users ───────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL UNIQUE CHECK (length(username) BETWEEN 3 AND 30),
  display_name  TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'user',
  bio           TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_role     ON users (role);

-- ─── TABELA: tips ────────────────────────────────────────────────────────────
CREATE TABLE tips (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipster_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  esporte       TEXT NOT NULL,
  liga          TEXT NOT NULL,
  partida       TEXT NOT NULL,
  partida_data  TIMESTAMPTZ NOT NULL,
  mercado       TEXT NOT NULL,
  selecao       TEXT NOT NULL,
  odd           NUMERIC(6, 2) NOT NULL CHECK (odd >= 1),
  stake         SMALLINT NOT NULL CHECK (stake BETWEEN 1 AND 5),
  ev            NUMERIC(6, 2),
  resultado     tip_result NOT NULL DEFAULT 'pending',
  status        tip_status NOT NULL DEFAULT 'draft',
  analise_id    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at  TIMESTAMPTZ
);

CREATE INDEX idx_tips_tipster    ON tips (tipster_id);
CREATE INDEX idx_tips_esporte    ON tips (esporte);
CREATE INDEX idx_tips_status     ON tips (status);
CREATE INDEX idx_tips_resultado  ON tips (resultado);
CREATE INDEX idx_tips_published  ON tips (published_at DESC) WHERE status = 'published';

-- ─── TABELA: analises ────────────────────────────────────────────────────────
CREATE TABLE analises (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipster_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  tip_id        UUID REFERENCES tips (id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  excerpt       TEXT NOT NULL,
  content       TEXT NOT NULL,
  esporte       TEXT NOT NULL,
  liga          TEXT NOT NULL,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  meta_title    TEXT,
  meta_desc     TEXT,
  og_image      TEXT,
  views         INTEGER NOT NULL DEFAULT 0,
  is_premium    BOOLEAN NOT NULL DEFAULT FALSE,
  status        tip_status NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at  TIMESTAMPTZ
);

CREATE INDEX idx_analises_slug      ON analises (slug);
CREATE INDEX idx_analises_tipster   ON analises (tipster_id);
CREATE INDEX idx_analises_esporte   ON analises (esporte);
CREATE INDEX idx_analises_published ON analises (published_at DESC) WHERE status = 'published';
CREATE INDEX idx_analises_tags      ON analises USING gin (tags);
-- Busca full-text
CREATE INDEX idx_analises_fts ON analises USING gin (to_tsvector('portuguese', title || ' ' || excerpt));

-- ─── TABELA: boloes ──────────────────────────────────────────────────────────
CREATE TABLE boloes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  owner_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  invite_code   TEXT NOT NULL UNIQUE,
  max_members   INTEGER CHECK (max_members > 0),
  deadline      TIMESTAMPTZ NOT NULL,
  tips          UUID[] NOT NULL DEFAULT '{}',
  status        bolao_status NOT NULL DEFAULT 'open',
  is_public     BOOLEAN NOT NULL DEFAULT TRUE,
  prize_desc    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ
);

CREATE INDEX idx_boloes_owner       ON boloes (owner_id);
CREATE INDEX idx_boloes_invite_code ON boloes (invite_code);
CREATE INDEX idx_boloes_status      ON boloes (status);

-- ─── TABELA: palpites ────────────────────────────────────────────────────────
CREATE TABLE palpites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bolao_id    UUID NOT NULL REFERENCES boloes (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  palpites    JSONB NOT NULL DEFAULT '{}',
  pontos      INTEGER,
  posicao     INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bolao_id, user_id)
);

CREATE INDEX idx_palpites_bolao ON palpites (bolao_id);
CREATE INDEX idx_palpites_user  ON palpites (user_id);

-- ─── TABELA: tipster_stats (view materializada) ───────────────────────────────
CREATE TABLE tipster_stats (
  user_id      UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  total_tips   INTEGER NOT NULL DEFAULT 0,
  wins         INTEGER NOT NULL DEFAULT 0,
  losses       INTEGER NOT NULL DEFAULT 0,
  pushes       INTEGER NOT NULL DEFAULT 0,
  win_rate     NUMERIC(5, 4) NOT NULL DEFAULT 0,
  roi          NUMERIC(8, 4) NOT NULL DEFAULT 0,
  lucro_total  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  odd_media    NUMERIC(6, 2) NOT NULL DEFAULT 0,
  stake_media  NUMERIC(4, 2) NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

-- Users: perfis públicos são visíveis por todos
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users públicos são visíveis" ON users FOR SELECT USING (TRUE);
CREATE POLICY "Usuário edita próprio perfil" ON users FOR UPDATE USING (auth.uid() = id);

-- Tips: publicadas são visíveis por todos
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tips publicadas são visíveis" ON tips FOR SELECT
  USING (status = 'published' OR tipster_id = auth.uid());
CREATE POLICY "Tipster gerencia próprias tips" ON tips FOR ALL
  USING (tipster_id = auth.uid());
CREATE POLICY "Admin gerencia todas tips" ON tips FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Analises: publicadas visíveis, premium requer assinatura
ALTER TABLE analises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analises publicadas visíveis" ON analises FOR SELECT
  USING (status = 'published' AND (is_premium = FALSE OR tipster_id = auth.uid()));
CREATE POLICY "Tipster gerencia próprias analises" ON analises FOR ALL
  USING (tipster_id = auth.uid());

-- Boloes: públicos visíveis, privados só com código
ALTER TABLE boloes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bolões públicos visíveis" ON boloes FOR SELECT
  USING (is_public = TRUE OR owner_id = auth.uid());
CREATE POLICY "Usuário cria bolões" ON boloes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Dono gerencia bolão" ON boloes FOR ALL USING (owner_id = auth.uid());

-- Palpites: usuário vê apenas os próprios (até deadline)
ALTER TABLE palpites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário gerencia próprios palpites" ON palpites FOR ALL
  USING (user_id = auth.uid());
CREATE POLICY "Palpites visíveis após fechamento" ON palpites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boloes b WHERE b.id = bolao_id AND b.status IN ('closed','finished')
  ));

-- Stats públicas
ALTER TABLE tipster_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stats são públicas" ON tipster_stats FOR SELECT USING (TRUE);

-- ─── TRIGGER: atualiza updated_at ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER palpites_updated_at BEFORE UPDATE ON palpites FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── TRIGGER: cria perfil ao registrar ───────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Habilita Realtime para palpites (bolão ao vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE palpites;
ALTER PUBLICATION supabase_realtime ADD TABLE boloes;
