"use server";

import { revalidatePath } from "next/cache";
import { ENTITLEMENTS, type EntitlementId } from "@/lib/access/entitlement-types";
import { grantEntitlementByEmail, revokeEntitlement } from "@/lib/access/entitlements";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export type AccessActionState = {
  ok: boolean;
  message: string;
};

const INITIAL_STATE: AccessActionState = {
  ok: false,
  message: "",
};

function entitlementFromForm(value: FormDataEntryValue | null): EntitlementId | null {
  const raw = String(value ?? "").trim();
  return ENTITLEMENTS.includes(raw as EntitlementId) ? (raw as EntitlementId) : null;
}

export async function grantAccessAction(
  prev: AccessActionState = INITIAL_STATE,
  formData: FormData,
): Promise<AccessActionState> {
  void prev;
  const gate = await requireAdminActor();
  if (!gate.ok) return { ok: false, message: gate.error };

  const email = String(formData.get("email") ?? "");
  const entitlement = entitlementFromForm(formData.get("entitlement"));
  const expiresAt = String(formData.get("expires_at") ?? "").trim() || null;

  if (!entitlement) {
    return { ok: false, message: "Selecione um acesso válido." };
  }

  const result = await grantEntitlementByEmail({
    email,
    entitlement,
    expiresAt,
    source: "manual_admin",
  });

  revalidatePath("/admin/acessos");
  return result.ok
    ? { ok: true, message: "Acesso concedido." }
    : { ok: false, message: result.error };
}

export async function revokeAccessAction(formData: FormData): Promise<void> {
  const gate = await requireAdminActor();
  if (!gate.ok) return;

  const id = String(formData.get("id") ?? "");
  await revokeEntitlement(id);
  revalidatePath("/admin/acessos");
}
