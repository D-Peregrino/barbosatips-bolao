import type {
  AutoInsight,
  InteligenciaFixture,
  InteligenciaSnapshot,
  SportId,
} from "./types";

function isoNow(): string {
  return new Date().toISOString();
}

function baseFixture(sport: SportId): InteligenciaFixture {
  if (sport === "football") {
    return {
      id: "fx-mock-fb-01",
      kickoffLabel: "Sáb 21:45 · Primeira Liga",
      home: "Sporting CP",
      away: "FC Porto",
      competition: "liga_portugal",
    };
  }
  if (sport === "tennis") {
    return {
      id: "fx-mock-ten-01",
      kickoffLabel: "Sex 16:20 · Masters 1000",
      home: "J. Sinner",
      away: "C. Alcaraz",
      competition: "atp_masters",
    };
  }
  return {
    id: "fx-mock-nba-01",
    kickoffLabel: "Hoje 02:00 · NBA",
    home: "Boston Celtics",
    away: "Denver Nuggets",
    competition: "nba_reg",
  };
}

function insightsFromSnapshot(s: Omit<InteligenciaSnapshot, "insights">): AutoInsight[] {
  const out: AutoInsight[] = [];
  const topEv = s.evPositive[0];
  if (topEv && topEv.evPct >= 4) {
    out.push({
      id: "ins-ev",
      severity: "positive",
      title: "EV+ destacado",
      detail: `${topEv.market}: EV estimado +${topEv.evPct.toFixed(1)}% vs fecho médio modelado.`,
      tags: ["ev", "pricing"],
    });
  }
  const edge = s.fairOdds.find((r) => r.edgePct >= 3);
  if (edge) {
    out.push({
      id: "ins-edge",
      severity: "info",
      title: "Desvio vs odd justa",
      detail: `${edge.market} — implícita livro ${(edge.bookImplied * 100).toFixed(1)}% vs justa ${(edge.fairImplied * 100).toFixed(1)}%.`,
      tags: ["fair_odds"],
    });
  }
  const cs = [...s.correctScores].sort((a, b) => b.pct - a.pct)[0];
  if (cs) {
    out.push({
      id: "ins-cs",
      severity: "info",
      title: "Correct score líder",
      detail: `Matriz: ${cs.home}-${cs.away} com ~${cs.pct.toFixed(1)}% de massa de probabilidade.`,
      tags: ["correct_score", "sim"],
    });
  }
  out.push({
    id: "ins-xg",
    severity: "warn",
    title: "xG vs resultado",
    detail:
      "Divergência entre xG acumulado e golos reais pode indicar finishing/run — validar com amostra maior.",
    tags: ["xg", "process"],
  });
  out.push({
    id: "ins-ml",
    severity: "info",
    title: "Pipeline ML (futuro)",
    detail:
      "Substituir `mock_v1` por modelo calibrado + intervalos de credibilidade antes de uso stake-aware.",
    tags: ["ml", "roadmap"],
  });
  return out.slice(0, 6);
}

export function buildMockSnapshot(sport: SportId): InteligenciaSnapshot {
  const fixture = baseFixture(sport);

  if (sport === "football") {
    const snapshot: Omit<InteligenciaSnapshot, "insights"> = {
      meta: {
        source: "mock_v1",
        generatedAt: isoNow(),
        sport,
        modelVersion: "bt-intel/football@0.9.14-mock",
        pipelineNotes: [
          "Ingestão: shots + xG sintético",
          "Odds: agregador fictício",
          "Reservado: calibração isotónica + ensemble mercados",
        ],
      },
      fixture,
      fairOdds: [
        {
          id: "1",
          market: "1X2",
          selection: "1",
          bookImplied: 0.42,
          fairImplied: 0.39,
          edgePct: 3.1,
        },
        {
          id: "2",
          market: "O/U 2.5",
          selection: "Over",
          bookImplied: 0.56,
          fairImplied: 0.52,
          edgePct: 4.2,
        },
        {
          id: "3",
          market: "BTTS",
          selection: "Sim",
          bookImplied: 0.58,
          fairImplied: 0.55,
          edgePct: 2.4,
        },
      ],
      evPositive: [
        {
          id: "e1",
          market: "Over 2.5 golos",
          fairProb: 0.52,
          bestOdds: 2.05,
          impliedFromOdds: 0.488,
          evPct: 6.6,
        },
        {
          id: "e2",
          market: "Cantos +9.5",
          fairProb: 0.47,
          bestOdds: 2.12,
          impliedFromOdds: 0.472,
          evPct: 4.1,
        },
      ],
      probabilities: [
        {
          blockTitle: "1X2 (modelo)",
          outcomes: [
            { label: "1", prob: 0.41 },
            { label: "X", prob: 0.29 },
            { label: "2", prob: 0.3 },
          ],
        },
        {
          blockTitle: "Over / Under 2.5",
          outcomes: [
            { label: "Over", prob: 0.54 },
            { label: "Under", prob: 0.46 },
          ],
        },
      ],
      correctScores: [
        { home: 1, away: 1, pct: 11.2 },
        { home: 2, away: 1, pct: 9.4 },
        { home: 1, away: 0, pct: 8.1 },
        { home: 2, away: 2, pct: 7.6 },
        { home: 0, away: 1, pct: 7.0 },
        { home: 1, away: 2, pct: 6.4 },
      ],
      heatmap: {
        title: "Mapa de pressão / finalizações (zona)",
        pitchRatio: { w: 105, h: 68 },
        zones: [
          { id: "z1", x: 6, y: 18, w: 22, h: 32, intensity: 0.35, label: "ME esq." },
          { id: "z2", x: 30, y: 12, w: 28, h: 44, intensity: 0.72, label: "Meio" },
          { id: "z3", x: 62, y: 10, w: 34, h: 48, intensity: 0.9, label: "Último terço" },
          { id: "z4", x: 78, y: 22, w: 20, h: 24, intensity: 0.55, label: "Área" },
        ],
      },
      xg: {
        title: "xG acumulado (simulado)",
        splits: [
          { team: fixture.home, xg: 1.62, shots: 14, onTarget: 5 },
          { team: fixture.away, xg: 1.18, shots: 11, onTarget: 4 },
        ],
      },
      form: {
        title: "Forma recente (normalizada)",
        sideLeft: fixture.home,
        sideRight: fixture.away,
        left: [
          { label: "J-10", value: 1 },
          { label: "J-9", value: 1 },
          { label: "J-8", value: 0 },
          { label: "J-7", value: 1 },
          { label: "J-6", value: -1 },
          { label: "J-5", value: 1 },
          { label: "J-4", value: 1 },
          { label: "J-3", value: 0 },
          { label: "J-2", value: 1 },
          { label: "J-1", value: 1 },
        ],
        right: [
          { label: "J-10", value: 1 },
          { label: "J-9", value: -1 },
          { label: "J-8", value: 1 },
          { label: "J-7", value: 1 },
          { label: "J-6", value: 1 },
          { label: "J-5", value: 0 },
          { label: "J-4", value: -1 },
          { label: "J-3", value: 1 },
          { label: "J-2", value: 1 },
          { label: "J-1", value: 0 },
        ],
      },
      comparison: [
        { key: "xG / jogo", left: "1.72", right: "1.51", lean: "left" },
        { key: "xGA / jogo", left: "0.88", right: "1.05", lean: "left" },
        { key: "PPDA médio", left: "9.2", right: "10.8", lean: "right" },
        { key: "Cantos a favor", left: "6.1", right: "5.4", lean: "left" },
      ],
      trends: [
        {
          id: "t1",
          name: "Prob. vitória casa (modelo)",
          color: "#34d399",
          points: [
            { t: "T-6d", v: 0.36 },
            { t: "T-5d", v: 0.38 },
            { t: "T-4d", v: 0.39 },
            { t: "T-3d", v: 0.4 },
            { t: "T-2d", v: 0.41 },
            { t: "T-1d", v: 0.41 },
            { t: "Now", v: 0.41 },
          ],
        },
        {
          id: "t2",
          name: "Implícita agregada mercado",
          color: "#c9a227",
          points: [
            { t: "T-6d", v: 0.4 },
            { t: "T-5d", v: 0.41 },
            { t: "T-4d", v: 0.41 },
            { t: "T-3d", v: 0.42 },
            { t: "T-2d", v: 0.42 },
            { t: "T-1d", v: 0.42 },
            { t: "Now", v: 0.42 },
          ],
        },
      ],
    };
    return { ...snapshot, insights: insightsFromSnapshot(snapshot) };
  }

  if (sport === "tennis") {
    const snapshot: Omit<InteligenciaSnapshot, "insights"> = {
      meta: {
        source: "mock_v1",
        generatedAt: isoNow(),
        sport,
        modelVersion: "bt-intel/tennis@0.8.2-mock",
        pipelineNotes: [
          "Serviço + rally length sintéticos",
          "Reservado: Markov chain por ponto / surface prior",
        ],
      },
      fixture,
      fairOdds: [
        {
          id: "1",
          market: "Moneyline",
          selection: "Sinner",
          bookImplied: 0.54,
          fairImplied: 0.51,
          edgePct: 3.4,
        },
        {
          id: "2",
          market: "Handicap games +1.5",
          selection: "Alcaraz",
          bookImplied: 0.48,
          fairImplied: 0.45,
          edgePct: 2.9,
        },
      ],
      evPositive: [
        {
          id: "e1",
          market: "Over 22.5 games",
          fairProb: 0.56,
          bestOdds: 1.92,
          impliedFromOdds: 0.521,
          evPct: 5.0,
        },
      ],
      probabilities: [
        {
          blockTitle: "Vencedor match",
          outcomes: [
            { label: fixture.home, prob: 0.51 },
            { label: fixture.away, prob: 0.49 },
          ],
        },
        {
          blockTitle: "Sets exatos",
          outcomes: [
            { label: "2-0", prob: 0.22 },
            { label: "2-1", prob: 0.29 },
            { label: "1-2", prob: 0.27 },
            { label: "0-2", prob: 0.22 },
          ],
        },
      ],
      correctScores: [
        { home: 2, away: 1, pct: 18.4 },
        { home: 1, away: 2, pct: 17.1 },
        { home: 2, away: 0, pct: 14.0 },
        { home: 0, away: 2, pct: 12.8 },
      ],
      heatmap: {
        title: "Mapa de winners (court)",
        pitchRatio: { w: 78, h: 36 },
        zones: [
          { id: "a", x: 4, y: 8, w: 22, h: 20, intensity: 0.45, label: "Deuce wide" },
          { id: "b", x: 28, y: 6, w: 22, h: 24, intensity: 0.62, label: "Centro" },
          { id: "c", x: 52, y: 8, w: 22, h: 20, intensity: 0.78, label: "Ad T" },
        ],
      },
      xg: {
        title: "Pressão por game (proxy)",
        splits: [
          { team: fixture.home, xg: 0.92, shots: 38, onTarget: 22 },
          { team: fixture.away, xg: 0.88, shots: 35, onTarget: 20 },
        ],
      },
      form: {
        title: "Últimos 10 (rating Elo Δ mock)",
        sideLeft: fixture.home,
        sideRight: fixture.away,
        left: Array.from({ length: 10 }, (_, i) => ({
          label: `M${i + 1}`,
          value: [1, 1, -1, 1, 1, 0, 1, 1, -1, 1][i] ?? 0,
        })),
        right: Array.from({ length: 10 }, (_, i) => ({
          label: `M${i + 1}`,
          value: [1, -1, 1, 1, 0, 1, 1, 1, 1, -1][i] ?? 0,
        })),
      },
      comparison: [
        { key: "1º serviço in mock %", left: "68%", right: "64%", lean: "left" },
        { key: "BP convertidos", left: "44%", right: "41%", lean: "left" },
        { key: "Retorno avg depth", left: "8.4m", right: "8.1m", lean: "left" },
      ],
      trends: [
        {
          id: "t1",
          name: "Prob. Sinner",
          color: "#60a5fa",
          points: [
            { t: "O-5d", v: 0.48 },
            { t: "O-4d", v: 0.49 },
            { t: "O-3d", v: 0.5 },
            { t: "O-2d", v: 0.505 },
            { t: "O-1d", v: 0.51 },
            { t: "Now", v: 0.51 },
          ],
        },
      ],
    };
    return { ...snapshot, insights: insightsFromSnapshot(snapshot) };
  }

  const snapshot: Omit<InteligenciaSnapshot, "insights"> = {
    meta: {
      source: "mock_v1",
      generatedAt: isoNow(),
      sport,
      modelVersion: "bt-intel/nba@0.7.6-mock",
      pipelineNotes: [
        "Possessions + eFG sintéticos",
        "Reservado: player-on/off Bayesian smoothing",
      ],
    },
    fixture,
    fairOdds: [
      {
        id: "1",
        market: "Spread -3.5",
        selection: "Boston",
        bookImplied: 0.52,
        fairImplied: 0.49,
        edgePct: 3.8,
      },
      {
        id: "2",
        market: "Total 224.5",
        selection: "Under",
        bookImplied: 0.51,
        fairImplied: 0.48,
        edgePct: 3.1,
      },
    ],
    evPositive: [
      {
        id: "e1",
        market: "Boston ML",
        fairProb: 0.58,
        bestOdds: 1.82,
        impliedFromOdds: 0.55,
        evPct: 4.6,
      },
    ],
    probabilities: [
      {
        blockTitle: "Moneyline",
        outcomes: [
          { label: fixture.home, prob: 0.58 },
          { label: fixture.away, prob: 0.42 },
        ],
      },
      {
        blockTitle: "Margin buckets",
        outcomes: [
          { label: "1-5 pts", prob: 0.24 },
          { label: "6-10", prob: 0.31 },
          { label: "11+", prob: 0.45 },
        ],
      },
    ],
    correctScores: [
      { home: 112, away: 108, pct: 6.2 },
      { home: 118, away: 114, pct: 5.4 },
      { home: 105, away: 102, pct: 4.9 },
    ],
    heatmap: {
      title: "Shot chart proxy (meia quadra)",
      pitchRatio: { w: 50, h: 47 },
      zones: [
        { id: "p1", x: 4, y: 8, w: 18, h: 14, intensity: 0.55, label: "Canto 3" },
        { id: "p2", x: 24, y: 6, w: 14, h: 18, intensity: 0.42, label: "Top key" },
        { id: "p3", x: 10, y: 26, w: 22, h: 14, intensity: 0.88, label: "Paint" },
        { id: "p4", x: 32, y: 24, w: 14, h: 16, intensity: 0.5, label: "Mid" },
      ],
    },
    xg: {
      title: "Pontos esperados (proxy eFG + FT)",
      splits: [
        { team: fixture.home, xg: 118.4, shots: 91, onTarget: 48 },
        { team: fixture.away, xg: 112.2, shots: 88, onTarget: 44 },
      ],
    },
    form: {
      title: "Net rating rolling 10",
      sideLeft: fixture.home,
      sideRight: fixture.away,
      left: [
        { label: "G1", value: 1 },
        { label: "G2", value: 1 },
        { label: "G3", value: -1 },
        { label: "G4", value: 1 },
        { label: "G5", value: 1 },
        { label: "G6", value: 1 },
        { label: "G7", value: -1 },
        { label: "G8", value: 1 },
        { label: "G9", value: 0 },
        { label: "G10", value: 1 },
      ],
      right: [
        { label: "G1", value: 1 },
        { label: "G2", value: 1 },
        { label: "G3", value: 1 },
        { label: "G4", value: -1 },
        { label: "G5", value: 1 },
        { label: "G6", value: 0 },
        { label: "G7", value: 1 },
        { label: "G8", value: 1 },
        { label: "G9", value: -1 },
        { label: "G10", value: 1 },
      ],
    },
    comparison: [
      { key: "Pace", left: "99.2", right: "97.8", lean: "left" },
      { key: "OffRtg", left: "118.1", right: "116.4", lean: "left" },
      { key: "DefRtg", left: "110.2", right: "112.0", lean: "left" },
      { key: "eFG%", left: "56.2%", right: "54.8%", lean: "left" },
    ],
    trends: [
      {
        id: "t1",
        name: "Spread implícito (pts)",
        color: "#f472b6",
        points: [
          { t: "T-5d", v: 4.2 },
          { t: "T-4d", v: 4.0 },
          { t: "T-3d", v: 3.9 },
          { t: "T-2d", v: 3.8 },
          { t: "T-1d", v: 3.7 },
          { t: "Now", v: 3.6 },
        ],
      },
    ],
  };
  return { ...snapshot, insights: insightsFromSnapshot(snapshot) };
}
