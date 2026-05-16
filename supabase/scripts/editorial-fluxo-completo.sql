-- BarbosaTips — fluxo editorial completo (Supabase SQL Editor)
-- Passo 1: executar analises-cms-schema-completo.sql
-- Passo 2: executar este ficheiro (bucket Storage para capas)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'analises',
  'analises',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "analises_storage_select_public" ON storage.objects;
CREATE POLICY "analises_storage_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'analises');
