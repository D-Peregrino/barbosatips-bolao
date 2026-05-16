import type { EntitlementId } from "@/lib/access/entitlement-types";

export const PAYMENT_PRODUCT_CODES = [
  "vip_premium",
  "bolao_copa",
  "discord_ouvinte",
  "discord_voz",
  "bot_barbosa",
] as const;

export type PaymentProductCode = (typeof PAYMENT_PRODUCT_CODES)[number];

export type PaymentProductConfig = {
  code: PaymentProductCode;
  entitlement: EntitlementId;
  title: string;
  description: string;
  amount: number;
  expiresInDays: number | null;
};

function amountFromEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const BOLAO_EVENT_EXPIRES_AT = "2026-07-20T03:00:00.000Z";

export const PAYMENT_PRODUCTS: Record<PaymentProductCode, PaymentProductConfig> = {
  vip_premium: {
    code: "vip_premium",
    entitlement: "vip_premium",
    title: "Barbosa VIP Premium",
    description: "30 dias de Picks Premium, Central EV+ e Football Insights.",
    amount: amountFromEnv("MP_PRICE_VIP_PREMIUM_BRL", 1),
    expiresInDays: 30,
  },
  bolao_copa: {
    code: "bolao_copa",
    entitlement: "bolao_copa",
    title: "Bolão Copa",
    description: "Acesso ao bolão oficial BarbosaTips.",
    amount: amountFromEnv("MP_PRICE_BOLAO_COPA_BRL", 1),
    expiresInDays: null,
  },
  discord_ouvinte: {
    code: "discord_ouvinte",
    entitlement: "discord_ouvinte",
    title: "Discord Ouvinte",
    description: "Acesso ao Discord como ouvinte.",
    amount: amountFromEnv("MP_PRICE_DISCORD_OUVINTE_BRL", 1),
    expiresInDays: null,
  },
  discord_voz: {
    code: "discord_voz",
    entitlement: "discord_voz",
    title: "Discord com Voz",
    description: "Acesso ao Discord com participação por voz.",
    amount: amountFromEnv("MP_PRICE_DISCORD_VOZ_BRL", 1),
    expiresInDays: null,
  },
  bot_barbosa: {
    code: "bot_barbosa",
    entitlement: "bot_barbosa",
    title: "Bot do Barbosa",
    description: "Alertas e oportunidades pelo Bot do Barbosa no Telegram.",
    amount: amountFromEnv("MP_PRICE_BOT_BARBOSA_BRL", 1),
    expiresInDays: null,
  },
};

export function isPaymentProductCode(value: string): value is PaymentProductCode {
  return PAYMENT_PRODUCT_CODES.includes(value as PaymentProductCode);
}

export function getPaymentProduct(value: string): PaymentProductConfig | null {
  return isPaymentProductCode(value) ? PAYMENT_PRODUCTS[value] : null;
}

export function getEntitlementExpiration(product: PaymentProductConfig): string | null {
  if (product.code === "bolao_copa") return BOLAO_EVENT_EXPIRES_AT;
  if (!product.expiresInDays) return null;
  return new Date(Date.now() + product.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
}
