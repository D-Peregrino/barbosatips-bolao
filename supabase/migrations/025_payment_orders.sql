-- Pedidos de pagamento externos (Mercado Pago) vinculados a entitlements comerciais.
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  product_code text not null,
  mp_preference_id text,
  mp_payment_id text,
  status text not null default 'pending',
  amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_orders_product_code_check check (
    product_code in (
      'vip_premium',
      'bolao_copa',
      'discord_ouvinte',
      'discord_voz',
      'bot_barbosa'
    )
  )
);

create index if not exists payment_orders_email_idx
  on public.payment_orders (lower(email), created_at desc);

create index if not exists payment_orders_user_idx
  on public.payment_orders (user_id, created_at desc);

create index if not exists payment_orders_preference_idx
  on public.payment_orders (mp_preference_id);

create unique index if not exists payment_orders_mp_payment_id_unique_idx
  on public.payment_orders (mp_payment_id)
  where mp_payment_id is not null;

create index if not exists payment_orders_status_idx
  on public.payment_orders (status, created_at desc);

create unique index if not exists user_entitlements_external_payment_id_unique_idx
  on public.user_entitlements (external_payment_id)
  where external_payment_id is not null;

create or replace function public.set_payment_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists payment_orders_set_updated_at on public.payment_orders;
create trigger payment_orders_set_updated_at
  before update on public.payment_orders
  for each row
  execute function public.set_payment_orders_updated_at();

alter table public.payment_orders enable row level security;
