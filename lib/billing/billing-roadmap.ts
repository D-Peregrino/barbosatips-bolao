/**
 * Contratos de integração futura (Mercado Pago, Stripe, assinaturas).
 * Nenhum pagamento é processado neste módulo — apenas tipos e placeholders estáveis.
 */

export type BillingProviderId = "mercado_pago" | "stripe" | "manual";

export type SubscriptionStatusPlaceholder =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

/** Plano comercial futuro — preços em centavos quando ligado a gateway. */
export type PlanPlaceholder = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Centavos BRL; null = a definir. */
  priceCentsBrl: number | null;
  interval: "month" | "year" | "one_time";
  /** Gateways previstos para este plano. */
  providers: BillingProviderId[];
  highlights: string[];
};

export const PLACEHOLDER_PLANS: PlanPlaceholder[] = [
  {
    id: "plan-vip-monthly",
    slug: "vip-mensal",
    name: "VIP Mensal",
    description: "Acesso a picks premium, análises longas e fila exclusiva.",
    priceCentsBrl: null,
    interval: "month",
    providers: ["mercado_pago", "stripe"],
    highlights: ["Centro live completo", "Alertas prioritários", "ROI histórico"],
  },
  {
    id: "plan-vip-yearly",
    slug: "vip-anual",
    name: "VIP Anual",
    description: "Mesmo pacote VIP com vantagem de permanência.",
    priceCentsBrl: null,
    interval: "year",
    providers: ["mercado_pago", "stripe"],
    highlights: ["Economia vs. mensal", "Mesmos benefícios VIP", "Suporte dedicado (fase 2)"],
  },
];

/** Onde o estado real de assinatura será lido no futuro (hoje: `users.is_subscriber_premium`). */
export const SUBSCRIPTION_STATE_SOURCE = "users.is_subscriber_premium" as const;
