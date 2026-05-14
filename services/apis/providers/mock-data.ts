import type {
  FixtureDTO,
  LiveEventDTO,
  OddsSnapshotDTO,
  SportDomain,
  StandingsDTO,
  TeamStatsDTO,
} from "@/services/apis/types";

const iso = (d: Date) => d.toISOString();

export function mockFixtures(sport: SportDomain, limit = 10): FixtureDTO[] {
  const base = new Date();
  const day = (n: number) => new Date(base.getTime() + n * 86400000);

  if (sport === "futebol") {
    const rows: FixtureDTO[] = [
      {
        id: "fb-br-001",
        sport: "futebol",
        competicao: "Brasileirão Série A",
        competicaoId: "bra-1",
        temporada: "2025",
        casa: { id: "fla", nome: "Flamengo", abbr: "FLA" },
        fora: { id: "pal", nome: "Palmeiras", abbr: "PAL" },
        inicioISO: iso(day(1)),
        status: "agendado",
        placar: null,
        meta: { rodada: 12 },
      },
      {
        id: "fb-br-002",
        sport: "futebol",
        competicao: "Copa do Brasil",
        competicaoId: "cdb",
        casa: { id: "gre", nome: "Grêmio" },
        fora: { id: "flu", nome: "Fluminense" },
        inicioISO: iso(day(0)),
        status: "live",
        placar: { casa: 1, fora: 1 },
        meta: { fase: "Oitavas" },
      },
      {
        id: "fb-ucl-001",
        sport: "futebol",
        competicao: "UEFA Champions League",
        competicaoId: "ucl",
        casa: { id: "rm", nome: "Real Madrid" },
        fora: { id: "mc", nome: "Man City" },
        inicioISO: iso(day(2)),
        status: "terminado",
        placar: { casa: 2, fora: 1 },
      },
    ];
    return Array.from({ length: Math.min(limit, rows.length) }, (_, i) => rows[i]!);
  }

  if (sport === "tenis") {
    const rows: FixtureDTO[] = [
      {
        id: "tn-atp-001",
        sport: "tenis",
        competicao: "ATP Masters 1000 — mock",
        competicaoId: "atp-m1000",
        casa: { id: "p1", nome: "Alcaraz" },
        fora: { id: "p2", nome: "Sinner" },
        inicioISO: iso(day(0)),
        status: "live",
        placar: { casa: 1, fora: 0 },
        meta: { superficie: "dura", sets: "1-0" },
      },
      {
        id: "tn-atp-002",
        sport: "tenis",
        competicao: "ATP 250 — mock",
        casa: { id: "p3", nome: "Norrie" },
        fora: { id: "p4", nome: "Musetti" },
        inicioISO: iso(day(1)),
        status: "agendado",
        meta: { superficie: "relva" },
      },
    ];
    return rows.slice(0, limit);
  }

  const nba: FixtureDTO[] = [
    {
      id: "nba-001",
      sport: "nba",
      competicao: "NBA Regular Season",
      competicaoId: "nba-rs",
      temporada: "2025-26",
      casa: { id: "lal", nome: "Lakers", abbr: "LAL" },
      fora: { id: "bos", nome: "Celtics", abbr: "BOS" },
      inicioISO: iso(day(0)),
      status: "live",
      placar: { casa: 54, fora: 58 },
      meta: { periodo: "Q2" },
    },
    {
      id: "nba-002",
      sport: "nba",
      competicao: "NBA Regular Season",
      casa: { id: "den", nome: "Nuggets" },
      fora: { id: "mia", nome: "Heat" },
      inicioISO: iso(day(1)),
      status: "agendado",
      placar: null,
    },
  ];
  return nba.slice(0, limit);
}

export function mockOddsSnapshot(sport: SportDomain, fixtureId: string): OddsSnapshotDTO | null {
  const fixtures = mockFixtures(sport, 20);
  if (!fixtures.some((f) => f.id === fixtureId)) return null;
  const mk = (
    mercado: string,
    selecoes: { id: string; nome: string; odd: number }[],
  ): OddsSnapshotDTO["mercados"][0] => ({
    id: `${fixtureId}-${mercado}`,
    mercado,
    selecoes: selecoes.map((s) => ({ ...s })),
  });
  if (sport === "futebol") {
    return {
      fixtureId,
      sport,
      atualizadoISO: new Date().toISOString(),
      fontes: ["mock-book", "mock-exchange"],
      mercados: [
        mk("1X2", [
          { id: "1", nome: "1", odd: 2.15 },
          { id: "x", nome: "X", odd: 3.2 },
          { id: "2", nome: "2", odd: 3.4 },
        ]),
        mk("Total golos 2.5", [
          { id: "o25", nome: "Over 2.5", odd: 1.92 },
          { id: "u25", nome: "Under 2.5", odd: 1.88 },
        ]),
      ],
    };
  }
  if (sport === "tenis") {
    return {
      fixtureId,
      sport,
      atualizadoISO: new Date().toISOString(),
      fontes: ["mock-tennis"],
      mercados: [
        mk("Vencedor", [
          { id: "h", nome: "Casa", odd: 1.72 },
          { id: "a", nome: "Fora", odd: 2.1 },
        ]),
        mk("Total jogos +21.5", [
          { id: "o", nome: "Over", odd: 1.83 },
          { id: "u", nome: "Under", odd: 1.95 },
        ]),
      ],
    };
  }
  return {
    fixtureId,
    sport,
    atualizadoISO: new Date().toISOString(),
    fontes: ["mock-nba"],
    mercados: [
      mk("Spread -4.5", [
        { id: "hc", nome: "Casa -4.5", odd: 1.91 },
        { id: "ac", nome: "Fora +4.5", odd: 1.91 },
      ]),
      mk("Total pontos 224.5", [
        { id: "o", nome: "Over", odd: 1.87 },
        { id: "u", nome: "Under", odd: 1.94 },
      ]),
    ],
  };
}

export function mockStandings(sport: SportDomain, competicaoId?: string): StandingsDTO {
  void competicaoId;
  if (sport === "futebol") {
    return {
      competicao: "Brasileirão Série A (mock)",
      competicaoId: "bra-1",
      temporada: "2025",
      sport,
      linhas: [
        { posicao: 1, equipa: "Botafogo", jogos: 11, pontos: 26, vitorias: 8, empates: 2, derrotas: 1 },
        { posicao: 2, equipa: "Palmeiras", jogos: 11, pontos: 24, vitorias: 7, empates: 3, derrotas: 1 },
        { posicao: 3, equipa: "Flamengo", jogos: 11, pontos: 22, vitorias: 7, empates: 1, derrotas: 3 },
      ],
    };
  }
  if (sport === "tenis") {
    return {
      competicao: "Race ATP (mock)",
      temporada: "2025",
      sport,
      linhas: [
        { posicao: 1, equipa: "Sinner", jogos: 42, pontos: 9850 },
        { posicao: 2, equipa: "Alcaraz", jogos: 38, pontos: 8620 },
      ],
    };
  }
  return {
    competicao: "NBA Conferência Oeste (mock)",
    temporada: "2025-26",
    sport,
    linhas: [
      { posicao: 1, equipa: "Thunder", jogos: 20, pontos: 16 },
      { posicao: 2, equipa: "Nuggets", jogos: 20, pontos: 14 },
      { posicao: 3, equipa: "Lakers", jogos: 20, pontos: 12 },
    ],
  };
}

export function mockTeamStats(sport: SportDomain, teamId: string, nome: string): TeamStatsDTO {
  if (sport === "futebol") {
    return {
      teamId,
      nome,
      sport,
      atualizadoISO: new Date().toISOString(),
      metricas: { xg_por_jogo: 1.62, xga_por_jogo: 0.98, remates_alvo: 5.4, posse: 58 },
    };
  }
  if (sport === "tenis") {
    return {
      teamId,
      nome,
      sport,
      atualizadoISO: new Date().toISOString(),
      metricas: { primeiro_servico_pct: 0.64, breaks_faceiros: 1.2, winners_por_set: 12 },
    };
  }
  return {
    teamId,
    nome,
    sport,
    atualizadoISO: new Date().toISOString(),
    metricas: { ortg: 118.2, drtg: 110.4, pace: 100.1, efg_pct: 0.56 },
  };
}

export function mockLiveEvents(sport: SportDomain): LiveEventDTO[] {
  const t = new Date().toISOString();
  if (sport === "futebol") {
    return [
      {
        id: "ev-fb-1",
        fixtureId: "fb-br-002",
        sport,
        minuto: 34,
        tipo: "golo",
        descricao: "Golo anulado após VAR (mock).",
        criadoISO: t,
      },
    ];
  }
  if (sport === "tenis") {
    return [
      {
        id: "ev-tn-1",
        fixtureId: "tn-atp-001",
        sport,
        periodo: "Set 2",
        tipo: "ponto",
        descricao: "Break confirmado — mock.",
        criadoISO: t,
      },
    ];
  }
  return [
    {
      id: "ev-nba-1",
      fixtureId: "nba-001",
      sport,
      minuto: 8,
      periodo: "Q2",
      tipo: "outro",
      descricao: "Série de 8-0 Lakers (mock).",
      criadoISO: t,
    },
  ];
}
