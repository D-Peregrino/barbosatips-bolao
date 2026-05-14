import { redirect } from "next/navigation";
import type { AdminPanelShellSession } from "@/lib/admin/supabase-admin";
import { isUserAdmin } from "@/lib/admin/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { AdminShellClient } from "@/components/admin/shell/AdminShellClient";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const email = user.email ?? "";
  const lastAt = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).getTime()
    : Date.now();

  const session: AdminPanelShellSession = { email, lastAt };

  return <AdminShellClient session={session}>{children}</AdminShellClient>;
}
