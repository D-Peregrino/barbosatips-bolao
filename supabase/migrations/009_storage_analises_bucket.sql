-- Bucket público para capas das análises (CMS editorial em /admin/analises).
-- Após aplicar: uploads feitos pelo servidor com SUPABASE_SERVICE_ROLE_KEY;
-- leitura via URL pública /storage/v1/object/public/analises/...

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

-- Leitura pública dos objetos deste bucket (necessário quando RLS está ativo em storage.objects).
DROP POLICY IF EXISTS "analises_storage_select_public" ON storage.objects;
CREATE POLICY "analises_storage_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'analises');

-- Upload/DELETE: apenas via service role no backend (sem política de escrita para anon/auth).
-- O client do admin não usa chave anónima no Storage; usa server action + service role.
