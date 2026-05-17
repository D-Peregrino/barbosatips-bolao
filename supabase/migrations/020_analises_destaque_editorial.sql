-- Destaques editoriais na home (CMS /admin-editorial).

ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS destaque_principal boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prioridade integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.analises.destaque_principal IS
  'Hero principal da home (maior prioridade entre os marcados).';
COMMENT ON COLUMN public.analises.prioridade IS
  'Ordem editorial na home (maior valor = mais prioritário).';

CREATE INDEX IF NOT EXISTS analises_destaque_principal_idx
  ON public.analises (destaque_principal, prioridade DESC, created_at DESC)
  WHERE status = 'publicado' AND destaque_principal = true;
