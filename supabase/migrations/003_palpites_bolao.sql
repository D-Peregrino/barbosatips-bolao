-- ═══════════════════════════════════════════════════════════════════════════
-- Bolão Copa 2026 — palpites por inscrição (e-mail validado em inscricoes_bolao)
-- Escrita via service role (Server Actions). Leitura pública para o painel admin.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.inscricoes_bolao
ADD COLUMN IF NOT EXISTS palpites_confirmados_at TIMESTAMPTZ;

COMMENT ON COLUMN public.inscricoes_bolao.palpites_confirmados_at IS
  'Quando o participante confirmou todos os palpites no fluxo /bolao/palpites; bloqueia novas edições.';

CREATE TABLE IF NOT EXISTS public.palpites_bolao (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscricao_id  UUID NOT NULL REFERENCES public.inscricoes_bolao (id) ON DELETE CASCADE,
  jogo_id       TEXT NOT NULL,
  placar_casa   SMALLINT,
  placar_fora   SMALLINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT palpites_bolao_placar_casa_range CHECK (placar_casa IS NULL OR (placar_casa >= 0 AND placar_casa <= 99)),
  CONSTRAINT palpites_bolao_placar_fora_range CHECK (placar_fora IS NULL OR (placar_fora >= 0 AND placar_fora <= 99)),
  CONSTRAINT palpites_bolao_inscricao_jogo_unique UNIQUE (inscricao_id, jogo_id)
);

CREATE INDEX IF NOT EXISTS idx_palpites_bolao_inscricao_id ON public.palpites_bolao (inscricao_id);
CREATE INDEX IF NOT EXISTS idx_palpites_bolao_jogo_id ON public.palpites_bolao (jogo_id);
CREATE INDEX IF NOT EXISTS idx_palpites_bolao_created_at ON public.palpites_bolao (created_at DESC);

COMMENT ON TABLE public.palpites_bolao IS 'Placares do bolão Copa 2026 por inscrição; jogo_id alinhado ao mock COPA2026_JOGOS.';

ALTER TABLE public.palpites_bolao ENABLE ROW LEVEL SECURITY;

-- Leitura para a chave pública usada no admin (mesmo padrão de inscricoes_bolao).
DROP POLICY IF EXISTS "palpites_bolao_select_publico" ON public.palpites_bolao;
CREATE POLICY "palpites_bolao_select_publico"
  ON public.palpites_bolao
  FOR SELECT
  USING (true);

-- Sem INSERT/UPDATE/DELETE para anon/authenticated: persistência apenas via service role.
