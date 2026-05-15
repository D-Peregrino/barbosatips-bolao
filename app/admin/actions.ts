"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAdminProfileRole,
  isAdminDbRole,
} from "@/lib/admin/supabase-admin";

export type AdminLoginState = {
  error: string | null;
};

function sanitizeAdminInternalPath(raw: string): string {
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/admin";
  if (!t.startsWith("/admin")) return "/admin";
  if (t === "/admin/login" || t.startsWith("/admin/login/")) return "/admin";
  return t;
}

function loginErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "Email ou senha incorretos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirma o email desta conta antes de entrar.";
  }
  if (m.includes("too many requests")) {
    return "Muitas tentativas. Aguarda alguns minutos e tenta de novo.";
  }
  return "Não foi possível iniciar sessão. Verifica email e senha.";
}

export async function loginAdminPanelAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("redirect") ?? "/admin");

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return {
      error:
        "Supabase não está configurado neste ambiente (URL / chave em falta). Não é possível iniciar sessão.",
    };
  }

  const { data: signInData, error: signError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (signError) {
    return { error: loginErrorMessage(signError.message) };
  }

  const user = signInData.user;
  if (!user?.id) {
    return { error: "Não foi possível validar a sessão. Tenta novamente." };
  }

  const { role, error: profileError } = await fetchAdminProfileRole(user.id);

  if (process.env.ADMIN_AUTH_DEBUG === "1") {
    console.log("ADMIN CHECK", {
      authUserId: user.id,
      dbRole: role,
      profileError,
    });
  }

  if (profileError) {
    await supabase.auth.signOut();
    return {
      error: `Perfil não encontrado em public.users (${profileError}). Confirma o SQL 018/backfill.`,
    };
  }

  if (!isAdminDbRole(role)) {
    await supabase.auth.signOut();
    redirect("/acesso-negado?motivo=permissao");
  }

  redirect(sanitizeAdminInternalPath(rawNext));
}

export async function logoutAdminPanelAction(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Sem Supabase configurado — redireciona na mesma.
  }
  redirect("/admin/login");
}
