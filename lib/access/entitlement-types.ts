export const ENTITLEMENTS = [
  "vip_premium",
  "bolao_copa",
  "discord_ouvinte",
  "bot_barbosa",
  "discord_voz",
] as const;

export type EntitlementId = (typeof ENTITLEMENTS)[number];

export type EntitlementStatus =
  | "ativo"
  | "active"
  | "revogado"
  | "revoked"
  | "cancelado"
  | "canceled"
  | "expirado"
  | "expired";

export const STORE_PRODUCT_TO_ENTITLEMENT = {
  "discord-ouvinte": "discord_ouvinte",
  "bot-barbosa": "bot_barbosa",
  "discord-voz": "discord_voz",
} as const;
