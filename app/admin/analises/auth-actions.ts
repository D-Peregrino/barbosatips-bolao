"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { LoginAnalisesFormState } from "@/lib/admin/analises-login-form-state";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  createAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";

export async function loginAdminAnalisesFormAction(
  _prev: LoginAnalisesFormState,
  formData: FormData,
): Promise<LoginAnalisesFormState> {
  const password = String(formData.get("password") ?? "");

  const expected = process.env.ADMIN_ANALISES_PASSWORD?.trim();
  if (!expected) {
    return {
      error:
        "Senha do admin de análises não configurada (ADMIN_ANALISES_PASSWORD).",
    };
  }

  if (password !== expected) {
    return { error: "Senha incorreta." };
  }

  const secret = adminAnalisesSessionSecret();
  if (!secret) {
    return {
      error:
        "Configure ADMIN_ANALISES_PASSWORD ou ADMIN_ANALISES_SESSION_SECRET.",
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

  redirect("/admin/analises");
}

export async function logoutAdminAnalisesAction(): Promise<void> {
  cookies().set(ADMIN_ANALISES_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/analises/login");
}
