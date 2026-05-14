-- Blocos estatísticos premium (JSON). Editorial-only; APIs futuras podem preencher.
ALTER TABLE public.analises
ADD COLUMN IF NOT EXISTS stat_blocks jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.analises.stat_blocks IS
  'Lista de blocos estatísticos (1x2, xG, forma, etc.) — UI premium na página da análise.';
