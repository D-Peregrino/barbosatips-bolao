-- Campos editoriais necessários pelo CMS de análises.
-- Migration aditiva: não remove nem sobrescreve dados existentes.

ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS campeonato text,
  ADD COLUMN IF NOT EXISTS tag text,
  ADD COLUMN IF NOT EXISTS confianca integer,
  ADD COLUMN IF NOT EXISTS imagem_url text,
  ADD COLUMN IF NOT EXISTS data_jogo timestamptz,
  ADD COLUMN IF NOT EXISTS odd numeric,
  ADD COLUMN IF NOT EXISTS mercado text,
  ADD COLUMN IF NOT EXISTS destaque_principal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS destaque_home boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS prioridade integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conteudo_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;
