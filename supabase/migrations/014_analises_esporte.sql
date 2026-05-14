-- Esporte editorial (slug alinhado a siteConfig.sports) para hubs /[esporte] e filtros.
ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS esporte text NOT NULL DEFAULT 'futebol';

CREATE INDEX IF NOT EXISTS analises_esporte_status_idx
  ON public.analises (esporte, status, created_at DESC);

COMMENT ON COLUMN public.analises.esporte IS
  'Slug do esporte (ex.: futebol, basquete, tenis) — alinhado a siteConfig.sports.';
