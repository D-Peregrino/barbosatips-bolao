-- Resultados liquidados dos snapshots EV+ (tracking automático vs API-Football).

create table if not exists public.market_ev_results (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.market_ev_snapshots (id) on delete cascade,
  fixture_id text not null,
  mercado text not null,
  odd numeric(10, 3) not null,
  resultado text not null,
  green boolean not null,
  lucro numeric(10, 4) not null,
  roi numeric(10, 4) not null,
  created_at timestamptz not null default now(),
  constraint market_ev_results_snapshot_uidx unique (snapshot_id)
);

comment on table public.market_ev_results is 'Liquidação de mercados EV+ após resultado final (API-Football)';

create index if not exists market_ev_results_created_at_idx
  on public.market_ev_results (created_at desc);

create index if not exists market_ev_results_fixture_id_idx
  on public.market_ev_results (fixture_id);

create index if not exists market_ev_results_mercado_idx
  on public.market_ev_results (mercado);

create index if not exists market_ev_results_green_idx
  on public.market_ev_results (green);

alter table public.market_ev_results enable row level security;
