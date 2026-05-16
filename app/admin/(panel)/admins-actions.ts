"use server";

import { revalidatePath } from "next/cache";
import {
  promoverUsuarioAdminPorEmail,
  removerAdminPorId,
} from "@/lib/admin/admin-users";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export type AdminUsersActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function promoverAdminPorEmailAction(
  _prev: AdminUsersActionResult | undefined,
  formData: FormData,
): Promise<AdminUsersActionResult> {
  const gate = await requireAdminActor();
  if (!gate.ok) return { ok: false, error: gate.error };

  const email = String(formData.get("email") ?? "");
  const result = await promoverUsuarioAdminPorEmail(email);
  if (!result.ok) return result;

  revalidatePath("/admin/admins");
  revalidatePath("/admin");
  return { ok: true };
}

export async function removerAdminAction(
  _prev: AdminUsersActionResult | undefined,
  formData: FormData,
): Promise<AdminUsersActionResult> {
  const gate = await requireAdminActor();
  if (!gate.ok) return { ok: false, error: gate.error };

  const userId = String(formData.get("user_id") ?? "").trim();
  const result = await removerAdminPorId(userId);
  if (!result.ok) return result;

  revalidatePath("/admin/admins");
  revalidatePath("/admin");
  return { ok: true };
}
