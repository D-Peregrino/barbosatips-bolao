-- Validação de quick_picks usa apenas colunas reais: status e resultado.
-- Mantido como no-op para preservar histórico de migrations.
CREATE INDEX IF NOT EXISTS idx_quick_picks_resultado_status
  ON public.quick_picks (resultado, status, horario_jogo DESC);
