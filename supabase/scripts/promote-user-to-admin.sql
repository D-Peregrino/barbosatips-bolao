-- ═══════════════════════════════════════════════════════════════════════════
-- BarbosaTips — Promover utilizador a administrador
-- Executar no Supabase: SQL Editor → New query → Run
--
-- Pré-requisito: migration 018_users_profiles_and_admin.sql (ou 001 + 018)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1) Substituir pelo email da conta Supabase Auth ─────────────────────────
-- Exemplo: 'admin@barbosatips.com.br'

-- Garantir linha em public.users (cria a partir de auth.users se faltar)
INSERT INTO public.users (id, email, username, role)
SELECT
  a.id,
  COALESCE(a.email, ''),
  left(
    CASE
      WHEN length(regexp_replace(lower(split_part(COALESCE(a.email, 'user'), '@', 1)), '[^a-z0-9_]', '', 'g')) >= 3
        THEN regexp_replace(lower(split_part(COALESCE(a.email, 'user'), '@', 1)), '[^a-z0-9_]', '', 'g')
      ELSE 'user' || substr(replace(a.id::TEXT, '-', ''), 1, 8)
    END,
    30
  ),
  'admin'::public.user_role
FROM auth.users a
WHERE lower(a.email) = lower('COLOQUE_SEU_EMAIL_AQUI@dominio.com')
ON CONFLICT (id) DO UPDATE
  SET
    role = 'admin'::public.user_role,
    email = EXCLUDED.email,
    updated_at = NOW();

-- ─── 2) Confirmar ───────────────────────────────────────────────────────────
SELECT
  u.id,
  u.email,
  u.username,
  u.role,
  u.created_at
FROM public.users u
INNER JOIN auth.users a ON a.id = u.id
WHERE lower(u.email) = lower('COLOQUE_SEU_EMAIL_AQUI@dominio.com');

-- ─── Alternativa: promover por UUID (copiar de Authentication → Users) ─────
-- UPDATE public.users
-- SET role = 'admin'::public.user_role, updated_at = NOW()
-- WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- ─── Listar todos os admins ─────────────────────────────────────────────────
-- SELECT id, email, username, role, created_at
-- FROM public.users
-- WHERE role = 'admin'
-- ORDER BY created_at;
