import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { isAdminDbRole, normalizeDbRole } from "@/lib/admin/supabase-admin";

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

function usernameFromEmail(email: string, id: string): string {
  const local = (email.split("@")[0] ?? "user").toLowerCase();
  let base = local.replace(/[^a-z0-9_]/g, "");
  if (base.length < 3) {
    base = `user${id.replace(/-/g, "").slice(0, 8)}`;
  }
  return base.slice(0, 30);
}

/** Procura utilizador em auth.users por email (paginação). */
async function encontrarAuthUserPorEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<User | null> {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("encontrarAuthUserPorEmail", error);
      return null;
    }
    const users = data.users ?? [];
    const match = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (match) return match;
    if (users.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }
  return null;
}

async function usernameDisponivel(
  admin: ReturnType<typeof createAdminClient>,
  candidate: string,
): Promise<string> {
  let username = candidate;
  let suffix = 0;
  for (;;) {
    const { data } = await admin.from("users").select("id").eq("username", username).limit(1);
    const row = data?.[0] as { id?: string } | undefined;
    if (!row?.id) return username;
    suffix += 1;
    username = `${candidate.slice(0, 26)}${suffix}`;
    if (suffix > 99) return `${candidate.slice(0, 20)}${Date.now().toString(36).slice(-6)}`;
  }
}

export async function listarUsuariosAdmin(): Promise<AdminUserRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("users")
      .select("id,email,role,created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("listarUsuariosAdmin", error);
      return [];
    }

    return (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        email: String(row.email ?? ""),
        role: normalizeDbRole(row.role) || "admin",
        created_at: String(row.created_at ?? ""),
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function contarAdmins(): Promise<number> {
  const lista = await listarUsuariosAdmin();
  return lista.length;
}

export type AdminUsersMutationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Promove conta existente em auth.users → role admin em public.users.
 */
export async function promoverUsuarioAdminPorEmail(
  emailRaw: string,
): Promise<AdminUsersMutationResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const email = emailRaw.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Indique um email válido." };
  }

  try {
    const admin = createAdminClient();
    const authUser = await encontrarAuthUserPorEmail(admin, email);

    if (!authUser?.id) {
      return {
        ok: false,
        error:
          "Conta não encontrada no Supabase Auth. O utilizador deve registar-se ou ser criado em Authentication primeiro.",
      };
    }

    const authEmail = (authUser.email ?? email).trim();

    const { data: existing } = await admin
      .from("users")
      .select("id,username,role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existing) {
      const role = normalizeDbRole((existing as { role?: string }).role);
      if (isAdminDbRole(role)) {
        return { ok: false, error: "Este utilizador já é administrador." };
      }
      const { error: upErr } = await admin
        .from("users")
        .update({ role: "admin", email: authEmail })
        .eq("id", authUser.id);
      if (upErr) {
        return { ok: false, error: upErr.message || "Erro ao promover." };
      }
      return { ok: true };
    }

    const baseUsername = usernameFromEmail(authEmail, authUser.id);
    const username = await usernameDisponivel(admin, baseUsername);

    const { error: insErr } = await admin.from("users").insert({
      id: authUser.id,
      email: authEmail,
      username,
      role: "admin",
    });

    if (insErr) {
      return { ok: false, error: insErr.message || "Erro ao criar perfil admin." };
    }

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro inesperado ao promover administrador." };
  }
}

/**
 * Remove papel admin (role → user). Impede remover o último admin.
 */
export async function removerAdminPorId(
  userId: string,
): Promise<AdminUsersMutationResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const id = userId.trim();
  if (!id) {
    return { ok: false, error: "Utilizador inválido." };
  }

  try {
    const admin = createAdminClient();
    const { data: alvo, error: fetchErr } = await admin
      .from("users")
      .select("id,email,role")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !alvo) {
      return { ok: false, error: "Utilizador não encontrado." };
    }

    if (!isAdminDbRole((alvo as { role?: string }).role)) {
      return { ok: false, error: "Este utilizador não é administrador." };
    }

    const total = await contarAdmins();
    if (total <= 1) {
      return {
        ok: false,
        error: "Não é possível remover o último administrador do sistema.",
      };
    }

    const { error: upErr } = await admin
      .from("users")
      .update({ role: "user" })
      .eq("id", id);

    if (upErr) {
      return { ok: false, error: upErr.message || "Erro ao remover admin." };
    }

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro inesperado ao remover administrador." };
  }
}
