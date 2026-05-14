import type { SupabaseClient } from "@supabase/supabase-js";

/** Dados mínimos para a shell do painel (sidebar / “última atividade”). */
export type AdminPanelShellSession = {
  email: string;
  lastAt: number;
};

export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return data.role === "admin";
}
