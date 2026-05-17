"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  ExcluirAnaliseEditorialResult,
  SalvarAnaliseEditorialResult,
} from "@/lib/admin-editorial/salvar-result";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseStatus } from "@/lib/analises/types";
import { conteudoEditorialParaGravacao } from "@/lib/analises/sanitize-html";
import { siteConfig } from "@/config/site";
import { getLeaguesForSport } from "@/lib/sport-routes";
import { normalizarSlugEditorial } from "@/lib/admin-editorial/normalizar-slug";
import { sanitizeAnalisePayload } from "@/lib/admin-editorial/analise-payload";

function revalidateSportHubs() {
  for (const s of siteConfig.sports) {
    revalidatePath(`/${s.slug}`);
    for (const l of getLeaguesForSport(s.slug)) {
      revalidatePath(`/${s.slug}/${l.slug}`);
    }
  }
}

function parseDecimalForm(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

function parseIntegerForm(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

function parseDataJogoForm(formData: FormData): string | null {
  const raw = String(formData.get("data_jogo") ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toISOString();
}

function payloadAnaliseReal(formData: FormData, slug: string, titulo: string) {
  const statusRaw = String(formData.get("status") ?? "").trim();
  const status: AnaliseStatus = statusRaw === "publicado" ? "publicado" : "rascunho";
  const now = new Date().toISOString();
  const imagemUrl = String(formData.get("imagem_url") ?? "").trim();

  const payload: Record<string, unknown> = {
    slug,
    titulo,
    resumo: String(formData.get("resumo") ?? "").trim(),
    conteudo: conteudoEditorialParaGravacao(formData.get("conteudo")),
    campeonato: String(formData.get("campeonato") ?? "").trim(),
    tag: String(formData.get("tag") ?? "").trim(),
    confianca: parseIntegerForm(formData, "confianca"),
    status,
    data_jogo: parseDataJogoForm(formData),
    odd: parseDecimalForm(formData, "odd"),
    mercado: String(formData.get("mercado") ?? "").trim(),
    destaque_principal: String(formData.get("destaque_principal") ?? "") === "1",
    destaque_home: String(formData.get("destaque_home") ?? "") === "1",
    prioridade: parseIntegerForm(formData, "prioridade") ?? 0,
    conteudo_premium: String(formData.get("conteudo_premium") ?? "") === "1",
    updated_at: now,
    published_at: status === "publicado" ? now : null,
  };
  if (imagemUrl) payload.imagem_url = imagemUrl;
  return sanitizeAnalisePayload(payload);
}

function revalidateAnalisePortal(slug: string, slugAnterior?: string) {
  revalidatePath("/admin-editorial");
  revalidatePath("/analises");
  revalidatePath(`/analise/${slug}`);
  revalidatePath("/premium");
  revalidatePath("/");
  revalidateSportHubs();
  const ant = slugAnterior?.trim().toLowerCase();
  if (ant && ant !== slug) {
    revalidatePath(`/analise/${ant}`);
    revalidatePath(`/admin-editorial/editar/${encodeURIComponent(ant)}`);
  }
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
  const slug = normalizarSlugEditorial(slugRaw);
  if (!titulo) {
    return { ok: false, error: "Título é obrigatório." };
  }
  if (!slug) {
    return { ok: false, error: "Slug inválido." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("analises").insert(payloadAnaliseReal(formData, slug, titulo));

  if (error) {
    if (String(error.code) === "23505") {
      return { ok: false, error: "Já existe uma análise com este slug." };
    }
    return { ok: false, error: error.message || "Erro ao gravar." };
  }

  revalidateAnalisePortal(slug);
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
  const slug = normalizarSlugEditorial(String(formData.get("slug") ?? ""));
  if (!titulo) {
    return { ok: false, error: "Título é obrigatório." };
  }
  if (!slug) {
    return { ok: false, error: "Slug inválido." };
  }

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
    .update(payloadAnaliseReal(formData, slug, titulo))
    .eq("id", id);

  if (error) {
    if (String(error.code) === "23505") {
      return { ok: false, error: "Já existe outra análise com este slug." };
    }
    return { ok: false, error: error.message || "Erro ao atualizar." };
  }

  revalidateAnalisePortal(slug, slugAnterior);
  redirect(
    `/admin-editorial?atualizado=1&slug=${encodeURIComponent(slug)}`,
  );
}

export async function excluirAnaliseEditorialAction(
  _prev: ExcluirAnaliseEditorialResult | undefined,
  formData: FormData,
): Promise<ExcluirAnaliseEditorialResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const slugConfirm = normalizarSlugEditorial(String(formData.get("slug_confirm") ?? ""));
  if (!id) {
    return { ok: false, error: "Identificador da análise em falta." };
  }
  if (!slugConfirm) {
    return { ok: false, error: "Confirme o slug para excluir." };
  }

  const admin = createAdminClient();
  const { data: row, error: errFetch } = await admin
    .from("analises")
    .select("id,slug")
    .eq("id", id)
    .maybeSingle();

  if (errFetch || !row) {
    return { ok: false, error: "Análise não encontrada." };
  }

  const slugDb = normalizarSlugEditorial(String((row as { slug?: string }).slug ?? ""));
  if (slugDb !== slugConfirm) {
    return { ok: false, error: "Slug de confirmação não coincide." };
  }

  const { error } = await admin.from("analises").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message || "Erro ao excluir." };
  }

  revalidateAnalisePortal(slugDb, slugDb);
  redirect("/admin-editorial?excluido=1");
}
