import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

/** Dados mínimos para a shell do painel (sidebar / “última atividade”). */
export type AdminPanelShellSession = {
  email: string;
  lastAt: number;
};

export type AdminProfileRole = {
  role: string | null;
  error: string | null;
};

/** Fonte única de verdade: coluna `public.users.role` (nunca auth metadata). */
export function normalizeDbRole(role: unknown): string {
  if (role == null) return "";
  return String(role).trim().toLowerCase();
}

export function isAdminDbRole(role: unknown): boolean {
  return normalizeDbRole(role) === "admin";
}

/**
 * Lê `public.users.role` pelo id do Supabase Auth.
 * Service role no servidor evita falhas de RLS na checagem admin.
 */
export async function fetchAdminProfileRole(authUserId: string): Promise<AdminProfileRole> {
  try {
    const db = createAdminClient();
    const { data: profile, error } = await db
      .from("users")
      .select("role")
      .eq("id", authUserId)
      .single();

    if (error) {
      return { role: null, error: error.message };
    }

    return { role: profile?.role ?? null, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao consultar public.users";
    return { role: null, error: message };
  }
}

function logAdminCheck(authUserId: string, profile: { role: string | null } | null, error: string | null) {
  if (process.env.ADMIN_AUTH_DEBUG !== "1") return;
  console.log("ADMIN CHECK", {
    authUserId,
    dbRole: profile?.role ?? null,
    error,
  });
}

/**
 * `supabase` mantido na assinatura por compatibilidade (middleware/layout);
 * a leitura do role usa sempre `public.users` via service role.
 */
export async function isUserAdmin(
  _supabase: SupabaseClient | null,
  userId: string,
): Promise<boolean> {
  const { role, error } = await fetchAdminProfileRole(userId);
  logAdminCheck(userId, role != null ? { role } : null, error);
  if (error) return false;
  return isAdminDbRole(role);
}
