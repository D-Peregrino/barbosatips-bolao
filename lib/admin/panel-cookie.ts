/**
 * Sessão do painel admin central (`/admin`) — email + senha (env).
 * Cookie assinado HMAC-SHA256 (Edge / middleware).
 */

export const ADMIN_PANEL_COOKIE = "barbosatips_admin_panel";

const COOKIE_MAX_MS = 30 * 24 * 60 * 60 * 1000;

export function adminPanelSessionSecret(): string {
  return (
    process.env.ADMIN_PANEL_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PANEL_PASSWORD?.trim() ||
    ""
  );
}

export function adminPanelExpectedEmail(): string {
  return (process.env.ADMIN_PANEL_EMAIL ?? "").trim().toLowerCase();
}

export function adminPanelExpectedPassword(): string {
  return process.env.ADMIN_PANEL_PASSWORD ?? "";
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

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Email sem `|` para caber no payload. */
function safeEmailToken(email: string): string {
  return normalizeEmail(email).replace(/\|/g, "");
}

/**
 * Cookie: exp|lastAt|email|sig — sig = HMAC(secret, `${exp}|${lastAt}|${email}`)
 */
export async function createAdminPanelCookieValue(
  secret: string,
  email: string,
  lastAtMs: number,
): Promise<string> {
  const exp = Date.now() + COOKIE_MAX_MS;
  const expStr = String(exp);
  const lastStr = String(lastAtMs);
  const em = safeEmailToken(email);
  const base = `${expStr}|${lastStr}|${em}`;
  const sig = await hmacHex(secret, base);
  return `${base}|${sig}`;
}

export async function verifyAdminPanelCookieValue(
  value: string | undefined | null,
  secret: string,
): Promise<boolean> {
  const parsed = await parseAdminPanelCookie(value, secret);
  return parsed !== null;
}

export type AdminPanelSession = {
  email: string;
  lastAt: number;
  exp: number;
};

export async function parseAdminPanelCookie(
  value: string | undefined | null,
  secret: string,
): Promise<AdminPanelSession | null> {
  if (!value || !secret) return null;
  const parts = value.split("|");
  if (parts.length !== 4) return null;
  const [expStr, lastStr, emailTok, sig] = parts;
  const exp = parseInt(expStr, 10);
  const lastAt = parseInt(lastStr, 10);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  if (!Number.isFinite(lastAt)) return null;
  const base = `${expStr}|${lastStr}|${emailTok}`;
  const expected = await hmacHex(secret, base);
  if (!timingSafeEqual(sig, expected)) return null;
  return { email: emailTok, lastAt, exp };
}

export async function refreshAdminPanelCookieIfStale(
  value: string | undefined | null,
  secret: string,
  staleMs = 5 * 60 * 1000,
): Promise<string | null> {
  const cur = await parseAdminPanelCookie(value, secret);
  if (!cur) return null;
  if (Date.now() - cur.lastAt < staleMs) return null;
  return createAdminPanelCookieValue(secret, cur.email, Date.now());
}

export function timingSafePasswordEqual(a: string, b: string): boolean {
  const aa = a.normalize("NFKC");
  const bb = b.normalize("NFKC");
  if (aa.length !== bb.length) return false;
  let x = 0;
  for (let i = 0; i < aa.length; i++) x |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  return x === 0;
}

export function credentialsMatchPanelEnv(
  email: string,
  password: string,
): boolean {
  const expectedE = adminPanelExpectedEmail();
  const expectedP = adminPanelExpectedPassword();
  if (!expectedE || !expectedP) return false;
  return (
    normalizeEmail(email) === expectedE &&
    timingSafePasswordEqual(password, expectedP)
  );
}
