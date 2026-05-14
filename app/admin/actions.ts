"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { error: signError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (signError) {
    return { error: "Email ou senha incorretos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não foi possível validar a sessão. Tenta novamente." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut();
    return {
      error: "Esta conta não tem permissão de administrador na BarbosaTips.",
    };
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
