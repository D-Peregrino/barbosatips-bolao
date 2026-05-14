"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_PANEL_COOKIE,
  adminPanelSessionSecret,
  createAdminPanelCookieValue,
  credentialsMatchPanelEnv,
} from "@/lib/admin/panel-cookie";

export type AdminLoginState = {
  error: string | null;
};

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function sanitizeAdminInternalPath(raw: string): string {
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/admin";
  if (!t.startsWith("/admin")) return "/admin";
  if (t === "/admin/login" || t.startsWith("/admin/login/")) return "/admin";
  return t;
}

export async function loginAdminPanelAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("redirect") ?? "/admin");

  if (!adminPanelSessionSecret()) {
    return {
      error:
        "Painel admin não configurado. Define ADMIN_PANEL_EMAIL e ADMIN_PANEL_PASSWORD (e opcionalmente ADMIN_PANEL_SESSION_SECRET) no servidor.",
    };
  }

  if (!credentialsMatchPanelEnv(email, password)) {
    return { error: "Email ou senha incorretos." };
  }

  const secret = adminPanelSessionSecret();
  const value = await createAdminPanelCookieValue(secret, email, Date.now());
  cookies().set(ADMIN_PANEL_COOKIE, value, COOKIE_OPTS);

  redirect(sanitizeAdminInternalPath(rawNext));
}

export async function logoutAdminPanelAction(): Promise<void> {
  cookies().set(ADMIN_PANEL_COOKIE, "", {
    ...COOKIE_OPTS,
    maxAge: 0,
  });
  redirect("/admin/login");
}
