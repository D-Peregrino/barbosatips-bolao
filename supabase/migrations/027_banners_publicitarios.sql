-- Banners publicitários clicáveis para afiliados/patrocinadores.

CREATE TABLE IF NOT EXISTS public.banners_publicitarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  imagem_url text NOT NULL,
  link_destino text NOT NULL,
  posicao text NOT NULL CHECK (
    posicao IN ('sidebar_left', 'sidebar_right', 'home_horizontal', 'mobile_banner')
  ),
  ativo boolean NOT NULL DEFAULT true,
  prioridade integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banners_publicitarios_posicao_idx
ON public.banners_publicitarios (posicao, ativo, prioridade DESC, created_at DESC);

ALTER TABLE public.banners_publicitarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners_publicitarios_select_active" ON public.banners_publicitarios;
CREATE POLICY "banners_publicitarios_select_active"
ON public.banners_publicitarios
FOR SELECT
TO anon, authenticated
USING (ativo = true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "banners_storage_select_public" ON storage.objects;
CREATE POLICY "banners_storage_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');
