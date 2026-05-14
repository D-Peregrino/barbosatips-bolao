-- Resultados: pendente, green, red, void
ALTER TABLE public.quick_picks DROP CONSTRAINT IF EXISTS quick_picks_resultado_check;

UPDATE public.quick_picks
SET resultado = CASE
  WHEN LOWER(TRIM(COALESCE(resultado, ''))) = 'green' THEN 'green'
  WHEN LOWER(TRIM(COALESCE(resultado, ''))) = 'red' THEN 'red'
  ELSE 'pendente'
END;

ALTER TABLE public.quick_picks
  ALTER COLUMN resultado SET DEFAULT 'pendente';

ALTER TABLE public.quick_picks
  ALTER COLUMN resultado SET NOT NULL;

ALTER TABLE public.quick_picks ADD CONSTRAINT quick_picks_resultado_check
  CHECK (resultado IN ('pendente', 'green', 'red', 'void'));

COMMENT ON COLUMN public.quick_picks.resultado IS 'pendente | green | red | void — picks ativas usam pendente até encerrar.';
