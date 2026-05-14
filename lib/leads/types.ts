export type LeadSource =
  | "popup"
  | "sticky"
  | "inline_analises"
  | "inline_picks"
  | "newsletter"
  | "comunidade";

export type LeadRow = {
  id: string;
  email: string;
  email_normalized: string;
  name: string | null;
  favorite_sport: string;
  want_picks: boolean;
  want_greens: boolean;
  want_premium_analises: boolean;
  want_live_alerts: boolean;
  source: string;
  created_at: string;
  updated_at: string;
};
