-- Conteúdo premium (análises editoriais + picks rápidas).
ALTER TABLE public.analises
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

ALTER TABLE public.quick_picks
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.analises.is_premium IS 'Análise exclusiva para assinantes premium.';
COMMENT ON COLUMN public.quick_picks.is_premium IS 'Pick rápida exclusiva para assinantes premium.';

-- Assinante premium (apenas se `public.users` existir neste projeto).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS is_subscriber_premium boolean NOT NULL DEFAULT false;
    COMMENT ON COLUMN public.users.is_subscriber_premium IS 'Utilizador com acesso total a conteúdo premium.';
  END IF;
END $$;
