"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  createAdminBolaoCookieValue,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";

export async function loginAdminBolaoAction(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const expected = process.env.ADMIN_BOLAO_PASSWORD?.trim();
  if (!expected) {
    return {
      ok: false,
      error: "Configure ADMIN_BOLAO_PASSWORD no servidor.",
    };
  }
  if (password !== expected) {
    return { ok: false, error: "Senha incorreta." };
  }
  const secret = adminBolaoSessionSecret();
  if (!secret) {
    return {
      ok: false,
      error: "Configure ADMIN_BOLAO_PASSWORD ou ADMIN_BOLAO_SESSION_SECRET.",
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
