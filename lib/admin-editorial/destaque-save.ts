import type { SupabaseClient } from "@supabase/supabase-js";
import type { DestaqueFormValues } from "@/lib/analises/destaque";

/** Garante um único `destaque_principal` activo (exclui o registo actual). */
export async function garantirUnicoDestaquePrincipal(
  admin: SupabaseClient,
  idAtual: string | null,
): Promise<void> {
  let q = admin
    .from("analises")
    .update({ destaque_principal: false })
    .eq("destaque_principal", true);
  if (idAtual) {
    q = q.neq("id", idAtual);
  }
  const { error } = await q;
  if (error) {
    console.error("garantirUnicoDestaquePrincipal", error);
  }
}

export function payloadDestaqueCampos(d: DestaqueFormValues) {
  return {
    destaque_home: d.destaque_home,
    destaque_principal: d.destaque_principal,
    prioridade: d.prioridade,
  };
}
