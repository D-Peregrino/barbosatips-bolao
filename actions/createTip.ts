"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseMock } from "@/lib/supabase/is-mock";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ApiResponse } from "@/types/database.types";

const CreateTipSchema = z.object({
  esporte:     z.string().min(1),
  liga:        z.string().min(1),
  partida:     z.string().min(3),
  partida_data: z.string().datetime(),
  mercado:     z.string().min(1),
  selecao:     z.string().min(2),
  odd:         z.number().min(1).max(100),
  stake:       z.number().int().min(1).max(5),
  ev:          z.number().optional().nullable(),
  analise_id:  z.string().uuid().optional().nullable(),
});

type CreateTipInput = z.infer<typeof CreateTipSchema>;

export async function createTip(
  input: CreateTipInput,
): Promise<ApiResponse<{ id: string }>> {
  if (isSupabaseMock()) {
    return {
      data:    null,
      error:   "Modo demonstração: Supabase não configurado. Publicação de tips desativada.",
      success: false,
    };
  }

  const supabase = createClient();

  // Verifica auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Não autenticado", success: false };
  }

  // Verifica role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["tipster", "admin"].includes(profile.role)) {
    return { data: null, error: "Sem permissão para publicar tips", success: false };
  }

  // Valida input
  const parsed = CreateTipSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data:    null,
      error:   parsed.error.errors[0]?.message ?? "Dados inválidos",
      success: false,
    };
  }

  // Insere no banco
  const { data, error } = await supabase
    .from("tips")
    .insert({
      ...parsed.data,
      tipster_id:   user.id,
      status:       "published",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  // Revalida cache das páginas que exibem tips
  revalidatePath("/");
  revalidatePath("/tips");
  revalidatePath(`/${input.esporte}`);

  return { data: { id: data.id }, error: null, success: true };
}
