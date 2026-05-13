"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  createAdminBolaoCookieValue,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";

/**
 * Login do painel `/admin/bolao`: apenas comparação com `process.env.ADMIN_BOLAO_PASSWORD`
 * (configure na Vercel em Settings → Environment Variables). Sem senha fixa no código.
 */
export async function loginAdminBolaoAction(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const expected = process.env.ADMIN_BOLAO_PASSWORD?.trim();
  if (!expected) {
    return {
      ok: false,
      error: "Senha do admin não configurada.",
    };
  }
  if (password !== expected) {
    return { ok: false, error: "Senha incorreta." };
  }
  const secret = adminBolaoSessionSecret();
  if (!secret) {
    return {
      ok: false,
      error: "Senha do admin não configurada.",
    };
  }
  const value = await createAdminBolaoCookieValue(secret);
  cookies().set(ADMIN_BOLAO_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function logoutAdminBolaoAction(): Promise<void> {
  cookies().set(ADMIN_BOLAO_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/bolao/login");
}
