-- Link manual do Mercado Pago por inscrição (sem integração de API).
ALTER TABLE public.inscricoes_bolao
ADD COLUMN IF NOT EXISTS link_pagamento text;

COMMENT ON COLUMN public.inscricoes_bolao.link_pagamento IS 'URL do checkout/link de pagamento Mercado Pago (preenchido manualmente no admin).';
