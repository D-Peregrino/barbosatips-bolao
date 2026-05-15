import { redirect } from "next/navigation";
import type { AdminPanelShellSession } from "@/lib/admin/supabase-admin";
import { isUserAdmin } from "@/lib/admin/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { AdminShellClient } from "@/components/admin/shell/AdminShellClient";

/**
 * Shell do painel central — sessão Supabase + `users.role = admin`.
 * Reutilizado em `/admin`, editorial, picks, leads e análises admin.
 */
export async function AdminPanelShell({ children }: { children: React.ReactNode }) {
  let supabase;
  try {
    supabase = createClient();
  } catch {
    redirect("/admin/login?erro=config&redirect=/admin");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?redirect=/admin");
  }

  if (!(await isUserAdmin(supabase, user.id))) {
    redirect("/acesso-negado?motivo=permissao");
  }

  const session: AdminPanelShellSession = {
    email: user.email ?? "",
    lastAt: user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : Date.now(),
  };

  return <AdminShellClient session={session}>{children}</AdminShellClient>;
}
