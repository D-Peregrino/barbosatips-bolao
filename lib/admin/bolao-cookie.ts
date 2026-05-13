/**
 * Sessão do painel admin do bolão (sem Supabase Auth).
 * Cookie assinado com HMAC-SHA256 (Web Crypto — compatível com Edge / middleware).
 */

export const ADMIN_BOLAO_COOKIE = "barbosatips_admin_bolao";

export function adminBolaoSessionSecret(): string {
  return (
    process.env.ADMIN_BOLAO_SESSION_SECRET?.trim() ||
    process.env.ADMIN_BOLAO_PASSWORD?.trim() ||
    ""
  );
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(buf), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

/** Valor do cookie: `${expMs}.${hexHmac}` */
export async function createAdminBolaoCookieValue(
  secret: string,
): Promise<string> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const expStr = String(exp);
  const sig = await hmacHex(secret, expStr);
  return `${expStr}.${sig}`;
}

export async function verifyAdminBolaoCookieValue(
  value: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!value || !secret) return false;
  const i = value.indexOf(".");
  if (i <= 0) return false;
  const expStr = value.slice(0, i);
  const sig = value.slice(i + 1);
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmacHex(secret, expStr);
  return timingSafeEqual(sig, expected);
}
