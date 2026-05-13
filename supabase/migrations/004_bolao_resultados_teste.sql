-- Resultados fictícios para modo de teste do ranking (admin).
-- Escrita apenas via service role (Server Actions). Leitura pública para o painel admin (REST anon).

CREATE TABLE IF NOT EXISTS public.bolao_resultados_teste (
  jogo_id             TEXT PRIMARY KEY,
  placar_casa_real    SMALLINT NOT NULL,
  placar_fora_real    SMALLINT NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bolao_resultados_teste_casa_range
    CHECK (placar_casa_real >= 0 AND placar_casa_real <= 99),
  CONSTRAINT bolao_resultados_teste_fora_range
    CHECK (placar_fora_real >= 0 AND placar_fora_real <= 99)
);

COMMENT ON TABLE public.bolao_resultados_teste IS
  'Placares reais de teste por jogo (Copa 2026 bolão); usados só para simular ranking no admin.';

ALTER TABLE public.bolao_resultados_teste ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bolao_resultados_teste_select_publico" ON public.bolao_resultados_teste;
CREATE POLICY "bolao_resultados_teste_select_publico"
  ON public.bolao_resultados_teste
  FOR SELECT
  USING (true);
