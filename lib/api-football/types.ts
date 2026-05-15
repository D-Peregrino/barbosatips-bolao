export type ApiFootballRawFixture = {
  fixture?: {
    id?: number;
    date?: string;
    timestamp?: number;
    timezone?: string;
    status?: { long?: string; short?: string; elapsed?: number | null };
    venue?: { name?: string | null; city?: string | null };
    referee?: string | null;
  };
  league?: {
    id?: number;
    name?: string;
    country?: string;
    logo?: string;
    season?: number;
    round?: string;
  };
  teams?: {
    home?: { id?: number; name?: string; logo?: string };
    away?: { id?: number; name?: string; logo?: string };
  };
  goals?: { home?: number | null; away?: number | null };
  score?: {
    halftime?: { home?: number | null; away?: number | null };
    fulltime?: { home?: number | null; away?: number | null };
  };
};

export type FootballFixtureSummary = {
  fixtureId: number;
  dateIso: string;
  kickoffLabel: string;
  statusShort: string;
  statusLong: string;
  leagueName: string;
  country: string;
  round: string | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  goalsHome: number | null;
  goalsAway: number | null;
  venueName: string | null;
  venueCity: string | null;
  venue: string | null;
  referee: string | null;
};

export type TeamMatchStats = {
  possession: string | null;
  shots: string | null;
  shotsOnTarget: string | null;
  corners: string | null;
  fouls: string | null;
  yellowCards: string | null;
  redCards: string | null;
};

export type MatchStatistics = {
  home: TeamMatchStats;
  away: TeamMatchStats;
};

export type TeamRecentForm = {
  sampleSize: number;
  wins: number;
  draws: number;
  losses: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
};

export type MatchTrends = {
  sampleSize: number;
  bttsPct: number;
  over25Pct: number;
  under25Pct: number;
  avgTotalGoals: number;
};

export type H2HMatch = {
  fixtureId: number;
  dateIso: string;
  kickoffLabel: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  goalsHome: number | null;
  goalsAway: number | null;
};

export type FootballFixtureEditorialDetail = {
  fixture: FootballFixtureSummary;
  statistics: MatchStatistics | null;
  form: { home: TeamRecentForm; away: TeamRecentForm };
  trends: MatchTrends;
  h2h: H2HMatch[];
};

export type FootballFixturesResult =
  | { ok: true; date: string; results: number; fixtures: FootballFixtureSummary[] }
  | { ok: false; error: string; apiErrors?: unknown };

export type FootballFixtureDetailResult =
  | { ok: true; detail: FootballFixtureEditorialDetail }
  | { ok: false; error: string; apiErrors?: unknown };
