-- Tracking interno de cliques em banners afiliados.

ALTER TABLE public.banners_publicitarios
ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.banner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid NOT NULL REFERENCES public.banners_publicitarios(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  user_agent text,
  referer text,
  session_id text
);

CREATE INDEX IF NOT EXISTS banner_clicks_banner_clicked_idx
ON public.banner_clicks (banner_id, clicked_at DESC);

ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_banner_click_count(p_banner_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.banners_publicitarios
  SET click_count = click_count + 1
  WHERE id = p_banner_id;
$$;
