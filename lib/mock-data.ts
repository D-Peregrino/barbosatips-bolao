import { siteConfig } from "@/config/site";
import type {
  AnaliseFilters,
  AnaliseWithTipster,
  BolaoCompleto,
  BolaoWithOwner,
  PaginatedResponse,
  Palpite,
  Tip,
  TipFilters,
  TipsterPublico,
  TipWithTipster,
} from "@/types/database.types";

function tipWithoutTipster(row: TipWithTipster): Tip {
  const { tipster, ...tip } = row;
  void tipster;
  return tip;
}

const ISO = (d: string) => d;

const tipsterA = {
  id:           "a0000001-0000-4000-8000-000000000001",
  username:     "barbosa",
  display_name: "Barbosa",
  avatar_url:   null as string | null,
  is_verified:  true,
};

const tipsterB = {
  id:           "a0000002-0000-4000-8000-000000000002",
  username:     "maria_odds",
  display_name: "Maria Odds",
  avatar_url:   null as string | null,
  is_verified:  true,
};

const baseTips: TipWithTipster[] = [
  {
    id:             "b1000001-0000-4000-8000-000000000001",
    tipster_id:     tipsterA.id,
    esporte:        "futebol",
    liga:           "brasileirao-serie-a",
    partida:        "Flamengo x Corinthians",
    partida_data:   ISO("2026-05-11T21:30:00.000Z"),
    mercado:        "Resultado (1X2)",
    selecao:        "Flamengo vence",
    odd:            1.72,
    stake:          3,
    ev:             4.2,
    resultado:      "pending",
    status:         "published",
    analise_id:     "c2000001-0000-4000-8000-000000000001",
    created_at:     ISO("2026-05-10T12:00:00.000Z"),
    published_at:   ISO("2026-05-10T12:05:00.000Z"),
    tipster:        tipsterA,
  },
  {
    id:             "b1000002-0000-4000-8000-000000000002",
    tipster_id:     tipsterB.id,
    esporte:        "basquete",
    liga:           "nba",
    partida:        "Lakers x Nuggets",
    partida_data:   ISO("2026-05-11T23:00:00.000Z"),
    mercado:        "Handicap asiático",
    selecao:        "Lakers +7.5",
    odd:            1.91,
    stake:          2,
    ev:             2.8,
    resultado:      "pending",
    status:         "published",
    analise_id:     null,
    created_at:     ISO("2026-05-10T14:00:00.000Z"),
    published_at:   ISO("2026-05-10T14:10:00.000Z"),
    tipster:        tipsterB,
  },
  {
    id:             "b1000003-0000-4000-8000-000000000003",
    tipster_id:     tipsterA.id,
    esporte:        "futebol",
    liga:           "libertadores",
    partida:        "Palmeiras x Boca Juniors",
    partida_data:   ISO("2026-05-12T00:30:00.000Z"),
    mercado:        "Ambas marcam",
    selecao:        "Sim",
    odd:            1.85,
    stake:          4,
    ev:             null,
    resultado:      "win",
    status:         "published",
    analise_id:     "c2000002-0000-4000-8000-000000000002",
    created_at:     ISO("2026-05-08T10:00:00.000Z"),
    published_at:   ISO("2026-05-08T10:02:00.000Z"),
    tipster:        tipsterA,
  },
  {
    id:             "b1000004-0000-4000-8000-000000000004",
    tipster_id:     tipsterB.id,
    esporte:        "futebol-americano",
    liga:           "nfl",
    partida:        "Chiefs x Bills (pré-temporada fictícia)",
    partida_data:   ISO("2026-05-15T18:00:00.000Z"),
    mercado:        "Spread",
    selecao:        "Bills -3.5",
    odd:            1.95,
    stake:          1,
    ev:             1.1,
    resultado:      "loss",
    status:         "published",
    analise_id:     null,
    created_at:     ISO("2026-05-07T16:00:00.000Z"),
    published_at:   ISO("2026-05-07T16:00:00.000Z"),
    tipster:        tipsterB,
  },
];

const analiseSlugs = {
  fla: "flamengo-corinthians-brasileirao-analise-demo",
  pal: "palmeiras-boca-libertadores-preview-demo",
  nba: "lakers-nuggets-nba-playoffs-demo",
} as const;

export const MOCK_ANALISES: AnaliseWithTipster[] = [
  {
    id:           "c2000001-0000-4000-8000-000000000001",
    tipster_id:   tipsterA.id,
    tip_id:       "b1000001-0000-4000-8000-000000000001",
    title:        "Flamengo x Corinthians: valor no Mengão no Maracanã",
    slug:         analiseSlugs.fla,
    excerpt:
      "Clássico com público forte, xG favorável e odd ainda reativa ao mercado asiático. Leitura tática e linha de gols.",
    content:
      "<p><strong>Modo demonstração</strong> — conteúdo fictício para desenvolvimento local sem Supabase.</p>" +
      "<p>O Flamengo chega com sequência positiva de finalizações; Corinthians reforça o meio mas sofre em transições defensivas.</p>" +
      "<p>Linha principal: vitória rubro-negra com stake moderada (3U) e monitoramento ao vivo.</p>",
    esporte:      "futebol",
    liga:         "brasileirao-serie-a",
    tags:         ["brasileirão", "clássico", "1x2"],
    meta_title:   null,
    meta_desc:    null,
    og_image:     null,
    views:        12840,
    is_premium:   false,
    status:       "published",
    created_at:   ISO("2026-05-09T08:00:00.000Z"),
    published_at: ISO("2026-05-10T11:00:00.000Z"),
    tipster:      { ...tipsterA },
    tip:          {
      id:        "b1000001-0000-4000-8000-000000000001",
      selecao:   "Flamengo vence",
      odd:       1.72,
      stake:     3,
      resultado: "pending",
    },
  },
  {
    id:           "c2000002-0000-4000-8000-000000000002",
    tipster_id:   tipsterA.id,
    tip_id:       "b1000003-0000-4000-8000-000000000003",
    title:        "Libertadores: Palmeiras x Boca — cenário de gols",
    slug:         analiseSlugs.pal,
    excerpt:
      "Confronto típico de poucos espaços; mesmo assim o histórico recente sugere chances de ambas marcarem em certa faixa de odd.",
    content:
      "<p>Análise <em>mock</em> para ambas marcarem com justificativa de pressão alta nos minutos finais.</p>",
    esporte:      "futebol",
    liga:         "libertadores",
    tags:         ["libertadores", "ambas marcam"],
    meta_title:   null,
    meta_desc:    null,
    og_image:     null,
    views:        9021,
    is_premium:   true,
    status:       "published",
    created_at:   ISO("2026-05-08T09:00:00.000Z"),
    published_at: ISO("2026-05-08T10:00:00.000Z"),
    tipster:      { ...tipsterA },
    tip:          {
      id:        "b1000003-0000-4000-8000-000000000003",
      selecao:   "Sim",
      odd:       1.85,
      stake:     4,
      resultado: "win",
    },
  },
  {
    id:           "c2000003-0000-4000-8000-000000000003",
    tipster_id:   tipsterB.id,
    tip_id:       null,
    title:        "NBA: Lakers x Nuggets — leitura de handicap",
    slug:         analiseSlugs.nba,
    excerpt:      "Mercado reagiu à escalação; há folga no spread da casa para o visitante.",
    content:      "<p>Texto fictício. Quando o Supabase estiver ativo, este artigo virá do banco.</p>",
    esporte:      "basquete",
    liga:         "nba",
    tags:         ["nba", "handicap"],
    meta_title:   null,
    meta_desc:    null,
    og_image:     null,
    views:        4102,
    is_premium:   false,
    status:       "published",
    created_at:   ISO("2026-05-07T12:00:00.000Z"),
    published_at: ISO("2026-05-07T12:30:00.000Z"),
    tipster:      { ...tipsterB },
    tip:          null,
  },
];

function sortTipsDesc(a: TipWithTipster, b: TipWithTipster): number {
  const da = a.published_at ?? "";
  const db = b.published_at ?? "";
  return db.localeCompare(da);
}

function filterTips(list: TipWithTipster[], f: TipFilters): TipWithTipster[] {
  return list.filter((t) => {
    if (f.esporte && t.esporte !== f.esporte) return false;
    if (f.liga && t.liga !== f.liga) return false;
    if (f.resultado && t.resultado !== f.resultado) return false;
    if (f.tipster_id && t.tipster_id !== f.tipster_id) return false;
    if (f.data_de && t.partida_data < f.data_de) return false;
    if (f.data_ate && t.partida_data > f.data_ate) return false;
    return true;
  });
}

export function mockTipsGetAll(filters: TipFilters = {}): PaginatedResponse<TipWithTipster> {
  const page     = filters.page ?? 1;
  const per_page = filters.per_page ?? siteConfig.pagination.tipsPerPage;
  const sorted     = [...baseTips].sort(sortTipsDesc);
  const filtered   = filterTips(sorted, filters);
  const total      = filtered.length;
  const from       = (page - 1) * per_page;
  const pageRows   = filtered.slice(from, from + per_page);

  return {
    data:    pageRows,
    total,
    page,
    perPage: per_page,
    hasMore: total > page * per_page,
    success: true,
    error:   null,
  };
}

export function mockTipsGetTipsOfTheDay(): TipWithTipster[] {
  const day = new Date().toISOString().slice(0, 10);
  return baseTips
    .filter((t) => t.status === "published")
    .slice(0, 6)
    .map((t, i) => ({
      ...t,
      partida_data: `${day}T${String(14 + i).padStart(2, "0")}:00:00.000Z`,
    }));
}

export function mockTipsGetById(id: string): TipWithTipster | null {
  return baseTips.find((t) => t.id === id) ?? null;
}

export function mockTipsGetByTipster(tipsterId: string, limit: number): TipWithTipster[] {
  return baseTips
    .filter((t) => t.tipster_id === tipsterId && t.status === "published")
    .sort(sortTipsDesc)
    .slice(0, limit);
}

export function mockTipsGetIdsForSitemap(): { id: string; updated_at: string }[] {
  return baseTips
    .filter((t) => t.status === "published" && t.published_at)
    .map((t) => ({ id: t.id, updated_at: t.published_at! }));
}

function filterAnalises(list: AnaliseWithTipster[], f: AnaliseFilters): AnaliseWithTipster[] {
  return list.filter((a) => {
    if (f.esporte && a.esporte !== f.esporte) return false;
    if (f.liga && a.liga !== f.liga) return false;
    if (f.tag && !a.tags.includes(f.tag)) return false;
    if (f.tipster_id && a.tipster_id !== f.tipster_id) return false;
    if (f.is_premium !== undefined && a.is_premium !== f.is_premium) return false;
    return a.status === "published";
  });
}

export function mockAnalisesGetAll(filters: AnaliseFilters = {}): PaginatedResponse<AnaliseWithTipster> {
  const page     = filters.page ?? 1;
  const per_page = filters.per_page ?? siteConfig.pagination.analisesPerPage;
  const sorted   = [...MOCK_ANALISES].sort((a, b) =>
    (b.published_at ?? "").localeCompare(a.published_at ?? ""),
  );
  const filtered = filterAnalises(sorted, filters);
  const total      = filtered.length;
  const from       = (page - 1) * per_page;
  const pageRows   = filtered.slice(from, from + per_page);

  return {
    data:    pageRows,
    total,
    page,
    perPage: per_page,
    hasMore: total > page * per_page,
    success: true,
    error:   null,
  };
}

export function mockAnalisesGetBySlug(slug: string): AnaliseWithTipster | null {
  return MOCK_ANALISES.find((a) => a.slug === slug && a.status === "published") ?? null;
}

export function mockAnalisesGetRelated(analise: AnaliseWithTipster, limit: number): AnaliseWithTipster[] {
  return MOCK_ANALISES.filter(
    (a) => a.id !== analise.id && a.esporte === analise.esporte && a.status === "published",
  )
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit);
}

export function mockAnalisesGetSlugsForStaticPaths(): string[] {
  return MOCK_ANALISES.filter((a) => a.status === "published").map((a) => a.slug);
}

const statsA = {
  user_id:     tipsterA.id,
  total_tips:  210,
  wins:        118,
  losses:      78,
  pushes:      14,
  win_rate:    56.2,
  roi:         8.4,
  lucro_total: 32.1,
  odd_media:   1.82,
  stake_media: 2.6,
  updated_at:  ISO("2026-05-11T08:00:00.000Z"),
};

const statsB = {
  user_id:     tipsterB.id,
  total_tips:  145,
  wins:        82,
  losses:      55,
  pushes:      8,
  win_rate:    56.6,
  roi:         6.1,
  lucro_total: 18.4,
  odd_media:   1.91,
  stake_media: 2.2,
  updated_at:  ISO("2026-05-11T08:00:00.000Z"),
};

export function mockTipsterGetRanking(limit: number): TipsterPublico[] {
  const users: TipsterPublico[] = [
    {
      id:            tipsterA.id,
      email:         "barbosa@demo.local",
      username:      tipsterA.username,
      display_name:  tipsterA.display_name,
      avatar_url:    null,
      role:          "tipster",
      bio:           "Tipster fictício — modo demo.",
      is_verified:   true,
      created_at:    ISO("2025-01-01T00:00:00.000Z"),
      updated_at:    ISO("2026-05-10T00:00:00.000Z"),
      stats:         statsA,
      tips_recentes: mockTipsGetByTipster(tipsterA.id, 10).map(tipWithoutTipster),
    },
    {
      id:            tipsterB.id,
      email:         "maria@demo.local",
      username:      tipsterB.username,
      display_name:  tipsterB.display_name,
      avatar_url:    null,
      role:          "tipster",
      bio:           "Basquete e NFL — dados mock.",
      is_verified:   true,
      created_at:    ISO("2025-03-15T00:00:00.000Z"),
      updated_at:    ISO("2026-05-10T00:00:00.000Z"),
      stats:         statsB,
      tips_recentes: mockTipsGetByTipster(tipsterB.id, 10).map(tipWithoutTipster),
    },
  ];
  return users.slice(0, limit);
}

export function mockTipsterGetByUsername(username: string): TipsterPublico | null {
  return mockTipsterGetRanking(50).find((u) => u.username === username) ?? null;
}

const bolaoOwnerUser = {
  id:           tipsterA.id,
  username:     tipsterA.username,
  display_name: tipsterA.display_name,
  avatar_url:   null as string | null,
};

const mockPalpiteRow: Palpite & {
  user: typeof bolaoOwnerUser;
} = {
  id:         "d3000001-0000-4000-8000-000000000001",
  bolao_id:   "e4000001-0000-4000-8000-000000000001",
  user_id:    tipsterB.id,
  palpites:   { "b1000001-0000-4000-8000-000000000001": "win" },
  pontos:     null,
  posicao:    null,
  created_at: ISO("2026-05-09T10:00:00.000Z"),
  updated_at: ISO("2026-05-09T10:00:00.000Z"),
  user:       {
    id:           tipsterB.id,
    username:     tipsterB.username,
    display_name: tipsterB.display_name,
    avatar_url:   null,
  },
};

const bolao1: BolaoWithOwner = {
  id:           "e4000001-0000-4000-8000-000000000001",
  name:         "Bolão Demo — Rodada 11",
  description:  "Bolão fictício para desenvolvimento local.",
  owner_id:     tipsterA.id,
  invite_code:  "DEMO01",
  max_members:  20,
  deadline:     ISO("2026-05-20T19:00:00.000Z"),
  tips:         ["b1000001-0000-4000-8000-000000000001", "b1000002-0000-4000-8000-000000000002"],
  status:       "open",
  is_public:    true,
  prize_desc:   "Camiseta fictícia",
  created_at:   ISO("2026-05-08T12:00:00.000Z"),
  finished_at:  null,
  owner:        bolaoOwnerUser,
  member_count: 3,
};

const bolao2: BolaoWithOwner = {
  id:           "e4000002-0000-4000-8000-000000000002",
  name:         "Copa entre amigos (mock)",
  description:  null,
  owner_id:     tipsterB.id,
  invite_code:  "DEMO02",
  max_members:  null,
  deadline:     ISO("2026-05-18T22:00:00.000Z"),
  tips:         ["b1000003-0000-4000-8000-000000000003"],
  status:       "closed",
  is_public:    true,
  prize_desc:   null,
  created_at:   ISO("2026-05-05T09:00:00.000Z"),
  finished_at:  null,
  owner:        {
    id:           tipsterB.id,
    username:     tipsterB.username,
    display_name: tipsterB.display_name,
    avatar_url:   null,
  },
  member_count: 12,
};

const MOCK_BOLAO_LIST: BolaoWithOwner[] = [bolao1, bolao2];

export function mockBolaoGetPublic(limit: number): BolaoWithOwner[] {
  return MOCK_BOLAO_LIST.filter((b) => b.is_public && ["open", "closed"].includes(b.status)).slice(0, limit);
}

export function mockBolaoGetById(id: string): BolaoCompleto | null {
  const b = MOCK_BOLAO_LIST.find((x) => x.id === id);
  if (!b) return null;
  const tips_detalhes = b.tips
    .map((tid) => mockTipsGetById(tid))
    .filter((t): t is TipWithTipster => t !== null);

  return {
    ...b,
    palpites:      [mockPalpiteRow],
    tips_detalhes,
  };
}

export function mockBolaoGetByInviteCode(code: string): BolaoWithOwner | null {
  return MOCK_BOLAO_LIST.find((x) => x.invite_code === code.toUpperCase()) ?? null;
}

export function mockBolaoCreate(payload: {
  name: string;
  description?: string;
  owner_id: string;
  deadline: string;
  tips: string[];
  is_public: boolean;
  max_members?: number;
  prize_desc?: string;
}): { id: string } {
  void payload;
  return { id: "e4000099-0000-4000-8000-000000000099" };
}

export function mockBolaoSubmitPalpite(payload: {
  bolao_id: string;
  user_id: string;
  palpites: Record<string, string>;
}): Palpite {
  return {
    id:         "d3000099-0000-4000-8000-000000000099",
    bolao_id:   payload.bolao_id,
    user_id:    payload.user_id,
    palpites:   payload.palpites,
    pontos:     null,
    posicao:    null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function mockBolaoGetUserBoloes(userId: string): BolaoWithOwner[] {
  return MOCK_BOLAO_LIST.filter((b) => {
    if (b.owner_id === userId) return true;
    return b.id === mockPalpiteRow.bolao_id && mockPalpiteRow.user_id === userId;
  });
}
