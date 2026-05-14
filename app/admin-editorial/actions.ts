"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SalvarAnaliseEditorialResult } from "@/lib/admin-editorial/salvar-result";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseStatus } from "@/lib/analises/types";
import { conteudoEditorialParaGravacao } from "@/lib/analises/sanitize-html";

function normalizarSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseOddConfianca(formData: FormData): { odd: number; confianca: number } {
  const oddNum = parseFloat(
    String(formData.get("odd") ?? "").replace(",", "."),
  );
  const odd = Number.isFinite(oddNum) ? oddNum : 0;
  const confRaw = parseInt(String(formData.get("confianca") ?? "").trim(), 10);
  const confianca = Number.isFinite(confRaw)
    ? Math.min(100, Math.max(0, confRaw))
    : 0;
  return { odd, confianca };
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
  const categoria = String(formData.get("categoria") ?? "").trim();
  const tags = String(formData.get("tags") ?? "").trim();
  const timeCasa = String(formData.get("time_casa") ?? "").trim();
  const timeFora = String(formData.get("time_fora") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const conteudo = conteudoEditorialParaGravacao(formData.get("conteudo"));
  const imagemCapa = String(formData.get("imagem_capa") ?? "").trim();
  const { odd, confianca } = parseOddConfianca(formData);

  const statusRaw = String(formData.get("status") ?? "").trim();
  const status: AnaliseStatus =
    statusRaw === "publicado" ? "publicado" : "rascunho";

  const admin = createAdminClient();
  const { error } = await admin.from("analises").insert({
    slug,
    titulo,
    campeonato,
    categoria,
    tags,
    time_casa: timeCasa,
    time_fora: timeFora,
    odd,
    confianca,
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

export async function atualizarAnaliseEditorialAction(
  _prev: SalvarAnaliseEditorialResult | undefined,
  formData: FormData,
): Promise<SalvarAnaliseEditorialResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Identificador da análise em falta." };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const slug = normalizarSlug(String(formData.get("slug") ?? ""));
  if (!titulo) {
    return { ok: false, error: "Título é obrigatório." };
  }
  if (!slug) {
    return { ok: false, error: "Slug inválido." };
  }

  const campeonato = String(formData.get("campeonato") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const tags = String(formData.get("tags") ?? "").trim();
  const timeCasa = String(formData.get("time_casa") ?? "").trim();
  const timeFora = String(formData.get("time_fora") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const conteudo = conteudoEditorialParaGravacao(formData.get("conteudo"));
  const imagemCapa = String(formData.get("imagem_capa") ?? "").trim();
  const { odd, confianca } = parseOddConfianca(formData);

  const statusRaw = String(formData.get("status") ?? "").trim();
  const status: AnaliseStatus =
    statusRaw === "publicado" ? "publicado" : "rascunho";

  const slugAnterior = String(formData.get("slug_anterior") ?? "")
    .trim()
    .toLowerCase();

  const admin = createAdminClient();
  const { data: atual, error: errFetch } = await admin
    .from("analises")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (errFetch || !atual) {
    return { ok: false, error: "Análise não encontrada." };
  }

  const slugDb = String((atual as { slug?: string }).slug ?? "").toLowerCase();
  if (slugAnterior && slugDb !== slugAnterior) {
    return {
      ok: false,
      error: "Slug original não coincide; recarregue a página de edição.",
    };
  }

  const { error } = await admin
    .from("analises")
    .update({
      slug,
      titulo,
      campeonato,
      categoria,
      tags,
      time_casa: timeCasa,
      time_fora: timeFora,
      odd,
      confianca,
      resumo,
      conteudo,
      imagem_capa: imagemCapa,
      status,
    })
    .eq("id", id);

  if (error) {
    if (String(error.code) === "23505") {
      return { ok: false, error: "Já existe outra análise com este slug." };
    }
    return { ok: false, error: error.message || "Erro ao atualizar." };
  }

  revalidatePath("/analises");
  revalidatePath(`/analise/${slug}`);
  if (slugAnterior && slugAnterior !== slug) {
    revalidatePath(`/analise/${slugAnterior}`);
  }
  redirect(
    `/admin-editorial?atualizado=1&slug=${encodeURIComponent(slug)}`,
  );
}
