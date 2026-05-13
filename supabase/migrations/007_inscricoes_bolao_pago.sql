-- Confirmação manual de pagamento da inscrição no bolão (admin marca como pago).
ALTER TABLE public.inscricoes_bolao
ADD COLUMN IF NOT EXISTS pago boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.inscricoes_bolao.pago IS 'Quando true, o participante pode salvar e confirmar palpites.';
