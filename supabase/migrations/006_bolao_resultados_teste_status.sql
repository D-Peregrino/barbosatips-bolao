-- Resultados de teste: status obrigatório após lançamento do placar (admin).

ALTER TABLE public.bolao_resultados_teste
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'finalizado';

ALTER TABLE public.bolao_resultados_teste
  DROP CONSTRAINT IF EXISTS bolao_resultados_teste_status_chk;

ALTER TABLE public.bolao_resultados_teste
  ADD CONSTRAINT bolao_resultados_teste_status_chk
    CHECK (status = 'finalizado');

COMMENT ON COLUMN public.bolao_resultados_teste.status IS
  'Sempre finalizado quando o placar de teste é gravado pelo painel admin.';