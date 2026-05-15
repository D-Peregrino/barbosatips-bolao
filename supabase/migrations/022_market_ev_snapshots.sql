-- Snapshots da Central de Mercados EV+ (histórico, cache e auditoria).
-- Acesso via SUPABASE_SERVICE_ROLE_KEY no servidor Next.js.

create table if not exists public.market_ev_snapshots (
  id uuid primary key default gen_random_uuid(),
  fixture_id text not null,
  jogo text not null,
  campeonato text not null,
  mercado text not null,
  odd numeric(10, 3) not null,
  probabilidade_real numeric(6, 2) not null,
  probabilidade_implicita numeric(6, 2) not null,
  fair_odd numeric(10, 3) not null,
  edge numeric(8, 2) not null,
  ev numeric(8, 4) not null,
  tier text not null,
  bookmaker text not null default '',
  kickoff_at timestamptz,
  source text not null default 'market_board',
  snapshot_date date not null default (timezone('America/Sao_Paulo', now()))::date,
  created_at timestamptz not null default now(),
  constraint market_ev_snapshots_tier_check check (
    tier in ('elite', 'forte', 'moderado', 'neutro', 'negativo')
  )
);

comment on table public.market_ev_snapshots is 'Histórico de mercados EV+ gerados pelo painel admin';

-- Evita duplicar o mesmo mercado/casa no mesmo dia (fuso São Paulo).
create unique index if not exists market_ev_snapshots_dedupe_uidx
  on public.market_ev_snapshots (fixture_id, mercado, bookmaker, snapshot_date);

create index if not exists market_ev_snapshots_created_at_idx
  on public.market_ev_snapshots (created_at desc);

create index if not exists market_ev_snapshots_snapshot_date_idx
  on public.market_ev_snapshots (snapshot_date desc);

create index if not exists market_ev_snapshots_ev_idx
  on public.market_ev_snapshots (ev desc);

create index if not exists market_ev_snapshots_tier_idx
  on public.market_ev_snapshots (tier);

create index if not exists market_ev_snapshots_mercado_idx
  on public.market_ev_snapshots (mercado);

create index if not exists market_ev_snapshots_campeonato_idx
  on public.market_ev_snapshots (campeonato);

alter table public.market_ev_snapshots enable row level security;
