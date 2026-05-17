-- ═══════════════════════════════════════════════════════════════════════════
-- BarbosaTips — public.analises (schema completo do CMS editorial)
-- Fonte: migrations 008, 010, 013, 014, 017 + lib/analises/types.ts + admin-editorial/actions.ts
--
-- Executar no Supabase SQL Editor (idempotente).
-- Nota: o schema antigo em 001_initial_schema.sql (title, tipster_id, etc.) é LEGADO
--       e não é usado pelo CMS actual — este script define a tabela editorial actual.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Tabela (criar se não existir) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL,
  titulo        text NOT NULL,
  campeonato    text NOT NULL DEFAULT '',
  time_casa     text NOT NULL DEFAULT '',
  time_fora     text NOT NULL DEFAULT '',
  odd           numeric(12, 2) NOT NULL DEFAULT 0,
  confianca     integer NOT NULL DEFAULT 0,
  resumo        text NOT NULL DEFAULT '',
  conteudo      text NOT NULL DEFAULT '',
  imagem_capa   text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'rascunho',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Colunas adicionadas em migrações posteriores ────────────────────────────
ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS esporte text NOT NULL DEFAULT 'futebol',
  ADD COLUMN IF NOT EXISTS stat_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS destaque_principal boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prioridade integer NOT NULL DEFAULT 0;

-- ─── Constraints ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  ALTER TABLE public.analises ADD CONSTRAINT analises_slug_key UNIQUE (slug);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.analises
    ADD CONSTRAINT analises_confianca_range CHECK (confianca >= 0 AND confianca <= 100);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.analises
    ADD CONSTRAINT analises_status_check CHECK (status IN ('rascunho', 'publicado'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS analises_status_created_idx
  ON public.analises (status, created_at DESC);

CREATE INDEX IF NOT EXISTS analises_esporte_status_idx
  ON public.analises (esporte, status, created_at DESC);

CREATE INDEX IF NOT EXISTS analises_slug_idx
  ON public.analises (slug);

CREATE INDEX IF NOT EXISTS analises_is_premium_idx
  ON public.analises (is_premium)
  WHERE is_premium = true;

-- ─── Comentários (documentação) ──────────────────────────────────────────────
COMMENT ON TABLE public.analises IS
  'Análises editoriais BarbosaTips — CMS /admin-editorial, portal /analises e /analise/[slug].';

COMMENT ON COLUMN public.analises.id IS 'UUID; gerado automaticamente.';
COMMENT ON COLUMN public.analises.slug IS 'URL amigável única (/analise/{slug}).';
COMMENT ON COLUMN public.analises.titulo IS 'Título editorial.';
COMMENT ON COLUMN public.analises.esporte IS 'Slug do esporte (siteConfig.sports): futebol, basquete, tenis, etc.';
COMMENT ON COLUMN public.analises.categoria IS 'Categoria editorial (ex.: Prognósticos, NBA).';
COMMENT ON COLUMN public.analises.tags IS 'Tags separadas por vírgula (ex.: futebol, over, valor).';
COMMENT ON COLUMN public.analises.campeonato IS 'Competição / liga (texto livre).';
COMMENT ON COLUMN public.analises.time_casa IS 'Equipa da casa.';
COMMENT ON COLUMN public.analises.time_fora IS 'Equipa visitante.';
COMMENT ON COLUMN public.analises.odd IS 'Odd sugerida (numeric).';
COMMENT ON COLUMN public.analises.confianca IS 'Confiança 0–100 (%).';
COMMENT ON COLUMN public.analises.resumo IS 'Resumo curto (listagens, SEO).';
COMMENT ON COLUMN public.analises.conteudo IS 'Corpo HTML/Markdown sanitizado no servidor.';
COMMENT ON COLUMN public.analises.imagem_capa IS 'URL da capa (Storage bucket analises ou URL externa).';
COMMENT ON COLUMN public.analises.status IS 'rascunho | publicado — só publicado aparece no site público (RLS).';
COMMENT ON COLUMN public.analises.is_premium IS 'true = conteúdo premium (gating no portal).';
COMMENT ON COLUMN public.analises.created_at IS 'Data de criação do registo.';
COMMENT ON COLUMN public.analises.stat_blocks IS
  'JSON array de blocos estatísticos (probability_1x2, fair_odd, form_recent, etc.).';

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analises_select_publicadas" ON public.analises;
CREATE POLICY "analises_select_publicadas"
  ON public.analises
  FOR SELECT
  TO anon, authenticated
  USING (status = 'publicado');

-- Escrita: CMS usa SUPABASE_SERVICE_ROLE_KEY (createAdminClient) — ignora RLS.
-- Se precisares de INSERT/UPDATE com JWT admin no futuro, adiciona políticas aqui.

GRANT SELECT ON public.analises TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Referência rápida — colunas usadas pelo código (COLUNAS em lib/analises/queries.ts)
-- ═══════════════════════════════════════════════════════════════════════════
-- id, slug, titulo, esporte, categoria, tags, campeonato, time_casa, time_fora,
-- odd, confianca, resumo, conteudo, imagem_capa, status, is_premium, created_at, stat_blocks,
-- destaque_principal, prioridade
--
-- INSERT/UPDATE (admin-editorial/actions.ts): mesmas colunas exceto id e created_at.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Verificação ─────────────────────────────────────────────────────────────
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analises'
ORDER BY ordinal_position;
