"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  createAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";

export async function loginAdminAnalisesAction(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const expected = process.env.ADMIN_ANALISES_PASSWORD?.trim();
  if (!expected) {
    return {
      ok: false,
      error: "Senha do admin de análises não configurada (ADMIN_ANALISES_PASSWORD).",
    };
  }
  if (password !== expected) {
    return { ok: false, error: "Senha incorreta." };
  }
  const secret = adminAnalisesSessionSecret();
  if (!secret) {
    return {
      ok: false,
      error: "Configure ADMIN_ANALISES_PASSWORD ou ADMIN_ANALISES_SESSION_SECRET.",
    };
  }
  const value = await createAdminAnalisesCookieValue(secret);
  cookies().set(ADMIN_ANALISES_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function logoutAdminAnalisesAction(): Promise<void> {
  cookies().set(ADMIN_ANALISES_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/analises/login");
}
