-- Campos operacionais ao fechar pick (green / red / void)
ALTER TABLE public.quick_picks
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

COMMENT ON COLUMN public.quick_picks.resolved_at IS 'Momento em que o resultado foi registado (admin).';

-- Picks já encerradas com resultado: preencher resolved_at com horário do jogo ou created_at
UPDATE public.quick_picks
SET resolved_at = COALESCE(horario_jogo, created_at)
WHERE status = 'encerrado'
  AND resultado IN ('green', 'red', 'void')
  AND resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_quick_picks_resolved_at
  ON public.quick_picks (resolved_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_quick_picks_resultado_status
  ON public.quick_picks (resultado, status, horario_jogo DESC);
