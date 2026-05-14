-- Leads BarbosaTips: newsletter, segmentação e interesses (email marketing futuro).
-- Acesso: apenas server-side com SUPABASE_SERVICE_ROLE_KEY (RLS activo, sem policies públicas).

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  name text,
  favorite_sport text not null default 'futebol',
  want_picks boolean not null default false,
  want_greens boolean not null default false,
  want_premium_analises boolean not null default false,
  want_live_alerts boolean not null default false,
  source text not null default 'newsletter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_email_len check (char_length(email_normalized) >= 5)
);

create unique index if not exists leads_email_normalized_uidx
  on public.leads (email_normalized);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_favorite_sport_idx on public.leads (favorite_sport);

comment on table public.leads is 'Newsletter e leads — CRUD via service role no Next.js';

alter table public.leads enable row level security;

create or replace function public.set_leads_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_leads_updated_at();
