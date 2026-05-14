/**
 * Contratos para integração futura com ESP (Resend, SendGrid, Brevo, etc.) e automações.
 * Não envia email neste módulo.
 */

import type { LeadRow } from "@/lib/leads/types";

export type EspProviderId = "resend" | "sendgrid" | "brevo" | "mailchimp" | "custom";

export type AutomationTrigger =
  | "lead_created"
  | "lead_updated"
  | "new_pick"
  | "green_streak"
  | "live_alert";

export type FutureEmailPayload = {
  to: string;
  templateId: string;
  variables: Record<string, string | number | boolean>;
  /** Idempotência sugerida */
  dedupeKey?: string;
};

/** Formato exportável para CSV / webhooks (fase 2). */
export function leadRowToExportRow(row: LeadRow): Record<string, string | boolean> {
  return {
    email: row.email,
    name: row.name ?? "",
    favorite_sport: row.favorite_sport,
    want_picks: row.want_picks,
    want_greens: row.want_greens,
    want_premium_analises: row.want_premium_analises,
    want_live_alerts: row.want_live_alerts,
    source: row.source,
    created_at: row.created_at,
  };
}
