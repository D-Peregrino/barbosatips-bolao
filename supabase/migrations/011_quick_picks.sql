-- Picks rápidas BarbosaTips (sem análise completa).
CREATE TABLE public.quick_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  esporte text NOT NULL DEFAULT 'futebol',
  campeonato text NOT NULL DEFAULT '',
  jogo text NOT NULL,
  mercado text NOT NULL,
  odd numeric(12, 2) NOT NULL DEFAULT 0,
  confianca integer NOT NULL DEFAULT 50,
  justificativa text NOT NULL DEFAULT '',
  horario_jogo timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'ativo',
  resultado text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quick_picks_confianca_range CHECK (confianca >= 0 AND confianca <= 100),
  CONSTRAINT quick_picks_status_check CHECK (status IN ('ativo', 'encerrado')),
  CONSTRAINT quick_picks_resultado_check CHECK (
    resultado IS NULL OR resultado IN ('green', 'red')
  )
);

CREATE INDEX quick_picks_horario_idx ON public.quick_picks (horario_jogo DESC);
CREATE INDEX quick_picks_status_horario_idx ON public.quick_picks (status, horario_jogo DESC);

COMMENT ON TABLE public.quick_picks IS 'Picks rápidas — mercado, odd e confiança sem artigo longo.';

ALTER TABLE public.quick_picks ENABLE ROW LEVEL SECURITY;

-- Leitura pública (portal /picks).
CREATE POLICY "quick_picks_select_public"
  ON public.quick_picks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Escrita apenas via service role (sem política INSERT/UPDATE para anon).
