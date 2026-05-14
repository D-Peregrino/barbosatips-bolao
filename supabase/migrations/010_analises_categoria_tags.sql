-- Categoria e tags editoriais (CMS / listagem).
ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.analises.categoria IS 'Categoria editorial (ex.: Prognósticos, NBA).';
COMMENT ON COLUMN public.analises.tags IS 'Tags separadas por vírgula (ex.: futebol, over, valor).';
