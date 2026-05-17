-- BarbosaTips — garante schema editorial completo em public.analises (idempotente).
-- Equivalente a supabase/scripts/analises-cms-schema-completo.sql

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

ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS esporte text NOT NULL DEFAULT 'futebol',
  ADD COLUMN IF NOT EXISTS stat_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS destaque_principal boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prioridade integer NOT NULL DEFAULT 0;

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

CREATE INDEX IF NOT EXISTS analises_status_created_idx
  ON public.analises (status, created_at DESC);

CREATE INDEX IF NOT EXISTS analises_esporte_status_idx
  ON public.analises (esporte, status, created_at DESC);

CREATE INDEX IF NOT EXISTS analises_slug_idx ON public.analises (slug);

CREATE INDEX IF NOT EXISTS analises_is_premium_idx
  ON public.analises (is_premium)
  WHERE is_premium = true;

ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analises_select_publicadas" ON public.analises;
CREATE POLICY "analises_select_publicadas"
  ON public.analises
  FOR SELECT
  TO anon, authenticated
  USING (status = 'publicado');

GRANT SELECT ON public.analises TO anon, authenticated;
