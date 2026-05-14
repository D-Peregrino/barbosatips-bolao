"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SalvarAnaliseEditorialResult } from "@/lib/admin-editorial/salvar-result";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseStatus } from "@/lib/analises/types";

function normalizarSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function salvarNovaAnaliseEditorialAction(
  _prev: SalvarAnaliseEditorialResult | undefined,
  formData: FormData,
): Promise<SalvarAnaliseEditorialResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "");
  const slug = normalizarSlug(slugRaw);
  if (!titulo) {
    return { ok: false, error: "Título é obrigatório." };
  }
  if (!slug) {
    return { ok: false, error: "Slug inválido." };
  }

  const campeonato = String(formData.get("campeonato") ?? "").trim();
  const timeCasa = String(formData.get("time_casa") ?? "").trim();
  const timeFora = String(formData.get("time_fora") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim();
  const imagemCapa = String(formData.get("imagem_capa") ?? "").trim();

  const statusRaw = String(formData.get("status") ?? "").trim();
  const status: AnaliseStatus =
    statusRaw === "publicado" ? "publicado" : "rascunho";

  const admin = createAdminClient();
  const { error } = await admin.from("analises").insert({
    slug,
    titulo,
    campeonato,
    time_casa: timeCasa,
    time_fora: timeFora,
    odd: 0,
    confianca: 0,
    resumo,
    conteudo,
    imagem_capa: imagemCapa,
    status,
  });

  if (error) {
    if (String(error.code) === "23505") {
      return { ok: false, error: "Já existe uma análise com este slug." };
    }
    return { ok: false, error: error.message || "Erro ao gravar." };
  }

  revalidatePath("/analises");
  revalidatePath(`/analise/${slug}`);
  redirect(
    `/admin-editorial?gravado=1&slug=${encodeURIComponent(slug)}`,
  );
}
