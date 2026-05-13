-- Overrides editáveis dos jogos da Copa (calendário/status) no painel admin.
-- Valores NULL = usar dados do catálogo em código (COPA2026_JOGOS).

CREATE TABLE IF NOT EXISTS public.bolao_jogo_admin_override (
  jogo_id             TEXT PRIMARY KEY,
  data_iso            TEXT,
  horario             TEXT,
  status_manual       TEXT,
  inicio_partida_iso   TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bolao_jogo_admin_override_status_chk
    CHECK (
      status_manual IS NULL
      OR status_manual IN ('aberto', 'quase', 'encerrado')
    )
);

COMMENT ON TABLE public.bolao_jogo_admin_override IS
  'Campos opcionais que sobrescrevem o catálogo de jogos da Copa 2026 no admin.';

ALTER TABLE public.bolao_jogo_admin_override ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bolao_jogo_admin_override_select_publico"
  ON public.bolao_jogo_admin_override;
CREATE POLICY "bolao_jogo_admin_override_select_publico"
  ON public.bolao_jogo_admin_override
  FOR SELECT
  USING (true);
