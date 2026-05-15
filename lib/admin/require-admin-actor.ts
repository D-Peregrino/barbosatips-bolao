import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import {
  fetchAdminProfileRole,
  isAdminDbRole,
} from "@/lib/admin/supabase-admin";

export type AdminActor = {
  userId: string;
  email: string;
};

export type RequireAdminResult =
  | { ok: true; actor: AdminActor }
  | { ok: false; error: string };

/** Garante sessão Supabase Auth + role admin antes de mutações no painel. */
export async function requireAdminActor(): Promise<RequireAdminResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return { ok: false, error: "Sessão admin indisponível (configuração)." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { ok: false, error: "Sessão expirada. Inicie sessão novamente." };
  }

  const { role, error } = await fetchAdminProfileRole(user.id);
  if (error) {
    return { ok: false, error: "Não foi possível validar permissões." };
  }
  if (!isAdminDbRole(role)) {
    return { ok: false, error: "Sem permissão de administrador." };
  }

  return {
    ok: true,
    actor: {
      userId: user.id,
      email: user.email ?? "",
    },
  };
}
