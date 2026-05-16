import type { User } from "@supabase/supabase-js";
import {
  ENTITLEMENTS,
  type EntitlementId,
  type EntitlementStatus,
} from "@/lib/access/entitlement-types";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export type UserEntitlementRow = {
  id: string;
  user_id: string;
  entitlement: EntitlementId;
  status: EntitlementStatus;
  starts_at: string;
  expires_at: string | null;
  source: string;
  external_payment_id: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
};

export type EntitlementMutationResult =
  | { ok: true }
  | { ok: false; error: string };

const ACTIVE_STATUSES = new Set(["ativo", "active"]);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isActiveEntitlement(row: Pick<UserEntitlementRow, "status" | "starts_at" | "expires_at">): boolean {
  if (!ACTIVE_STATUSES.has(String(row.status).toLowerCase())) return false;

  const now = Date.now();
  const startsAt = row.starts_at ? Date.parse(row.starts_at) : 0;
  if (Number.isFinite(startsAt) && startsAt > now) return false;

  const expiresAt = row.expires_at ? Date.parse(row.expires_at) : null;
  if (expiresAt != null && Number.isFinite(expiresAt) && expiresAt <= now) return false;

  return true;
}

export async function userHasActiveEntitlement(
  userId: string,
  entitlement: EntitlementId,
): Promise<boolean> {
  if (shouldSkipLiveSupabase()) return false;
  const id = userId.trim();
  if (!id) return false;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_entitlements")
      .select("status,starts_at,expires_at")
      .eq("user_id", id)
      .eq("entitlement", entitlement)
      .in("status", ["ativo", "active"]);

    if (error) {
      console.error("userHasActiveEntitlement", error);
      return false;
    }

    return ((data ?? []) as UserEntitlementRow[]).some(isActiveEntitlement);
  } catch (error) {
    console.error("userHasActiveEntitlement", error);
    return false;
  }
}

async function findAuthUserByEmail(emailRaw: string): Promise<User | null> {
  if (shouldSkipLiveSupabase()) return null;
  const email = normalizeEmail(emailRaw);
  if (!email) return null;

  const admin = createAdminClient();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("findAuthUserByEmail", error);
      return null;
    }
    const user = data.users.find((u) => normalizeEmail(u.email ?? "") === email);
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
    if (page > 50) return null;
  }
}

export async function listUserEntitlements(): Promise<UserEntitlementRow[]> {
  if (shouldSkipLiveSupabase()) return [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_entitlements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("listUserEntitlements", error);
      return [];
    }

    const rows = (data ?? []) as UserEntitlementRow[];
    const userIds = Array.from(new Set(rows.map((row) => row.user_id).filter(Boolean)));
    if (userIds.length === 0) return rows;

    const { data: users } = await admin.from("users").select("id,email").in("id", userIds);
    const emailById = new Map(
      ((users ?? []) as { id: string; email: string }[]).map((user) => [user.id, user.email]),
    );

    return rows.map((row) => ({
      ...row,
      user_email: emailById.get(row.user_id) ?? "",
    }));
  } catch (error) {
    console.error("listUserEntitlements", error);
    return [];
  }
}

export async function grantEntitlementByEmail(params: {
  email: string;
  entitlement: EntitlementId;
  expiresAt?: string | null;
  source?: string;
}): Promise<EntitlementMutationResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const email = normalizeEmail(params.email);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Informe um email válido." };
  }
  if (!ENTITLEMENTS.includes(params.entitlement)) {
    return { ok: false, error: "Entitlement inválido." };
  }

  try {
    const admin = createAdminClient();
    const authUser = await findAuthUserByEmail(email);
    if (!authUser?.id) {
      return { ok: false, error: "Usuário não encontrado no Supabase Auth." };
    }

    const expiresAt = params.expiresAt?.trim() ? new Date(params.expiresAt).toISOString() : null;
    const { error } = await admin.from("user_entitlements").insert({
      user_id: authUser.id,
      entitlement: params.entitlement,
      status: "ativo",
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
      source: params.source?.trim() || "manual",
    });

    if (error) {
      return { ok: false, error: error.message || "Erro ao conceder acesso." };
    }
    return { ok: true };
  } catch (error) {
    console.error("grantEntitlementByEmail", error);
    return { ok: false, error: "Erro inesperado ao conceder acesso." };
  }
}

export async function revokeEntitlement(id: string): Promise<EntitlementMutationResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const entitlementId = id.trim();
  if (!entitlementId) {
    return { ok: false, error: "Acesso inválido." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("user_entitlements")
      .update({ status: "revogado" })
      .eq("id", entitlementId);

    if (error) {
      return { ok: false, error: error.message || "Erro ao remover acesso." };
    }
    return { ok: true };
  } catch (error) {
    console.error("revokeEntitlement", error);
    return { ok: false, error: "Erro inesperado ao remover acesso." };
  }
}
