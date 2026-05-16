-- Permissões comerciais separadas: VIP, Bolão e Lojinha.
-- Não integra pagamentos; guarda liberações manuais ou futuras confirmações externas.

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement text not null,
  status text not null default 'ativo',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  source text not null default 'manual',
  external_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_entitlement_check check (
    entitlement in (
      'vip_premium',
      'bolao_copa',
      'discord_ouvinte',
      'bot_barbosa',
      'discord_voz'
    )
  ),
  constraint user_entitlements_status_check check (
    status in ('ativo', 'active', 'revogado', 'revoked', 'cancelado', 'canceled', 'expirado', 'expired')
  )
);

create index if not exists user_entitlements_user_idx
  on public.user_entitlements (user_id);

create index if not exists user_entitlements_lookup_idx
  on public.user_entitlements (user_id, entitlement, status, starts_at, expires_at);

create index if not exists user_entitlements_created_at_idx
  on public.user_entitlements (created_at desc);

create or replace function public.set_user_entitlements_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_entitlements_set_updated_at on public.user_entitlements;
create trigger user_entitlements_set_updated_at
  before update on public.user_entitlements
  for each row
  execute function public.set_user_entitlements_updated_at();

alter table public.user_entitlements enable row level security;

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
create policy "user_entitlements_select_own"
  on public.user_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);
