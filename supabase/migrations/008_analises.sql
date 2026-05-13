-- Análises editoriais BarbosaTips (portal editorial).
CREATE TABLE public.analises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  campeonato text NOT NULL DEFAULT '',
  time_casa text NOT NULL DEFAULT '',
  time_fora text NOT NULL DEFAULT '',
  odd numeric(12, 2) NOT NULL DEFAULT 0,
  confianca integer NOT NULL DEFAULT 0,
  resumo text NOT NULL DEFAULT '',
  conteudo text NOT NULL DEFAULT '',
  imagem_capa text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'rascunho',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT analises_confianca_range CHECK (confianca >= 0 AND confianca <= 100),
  CONSTRAINT analises_status_check CHECK (status IN ('rascunho', 'publicado'))
);

CREATE INDEX analises_status_created_idx
  ON public.analises (status, created_at DESC);

COMMENT ON TABLE public.analises IS 'Análises esportivas — conteúdo editorial BarbosaTips.';

ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;

-- Leitura pública: apenas análises publicadas (anon + authenticated).
CREATE POLICY "analises_select_publicadas"
  ON public.analises
  FOR SELECT
  TO anon, authenticated
  USING (status = 'publicado');
