"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseStatus } from "@/lib/analises/types";
import { sanitizeAnaliseHtml } from "@/lib/analises/sanitize-html";

const CAPA_MAX_BYTES = 5 * 1024 * 1024;
const CAPA_ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;

function extensaoCapaPorNome(nome: string): "jpg" | "png" | "webp" | null {
  const n = nome.trim().toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpg";
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".webp")) return "webp";
  return null;
}

function mimeCapaPorExt(ext: "jpg" | "png" | "webp"): string {
  if (ext === "jpg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return "image/webp";
}

export async function uploadImagemCapaAnaliseAction(
  formData: FormData,
): Promise<
  { ok: true; publicUrl: string } | { ok: false; error: string }
> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo de imagem." };
  }

  if (file.size > CAPA_MAX_BYTES) {
    return { ok: false, error: "Arquivo muito grande (máximo 5 MB)." };
  }

  let contentType = (file.type || "").trim().toLowerCase();
  if (!CAPA_ALLOWED_MIMES.includes(contentType as (typeof CAPA_ALLOWED_MIMES)[number])) {
    const ext = extensaoCapaPorNome(file.name);
    if (ext) contentType = mimeCapaPorExt(ext);
  }

  if (!CAPA_ALLOWED_MIMES.includes(contentType as (typeof CAPA_ALLOWED_MIMES)[number])) {
    return {
      ok: false,
      error: "Formato não aceito. Use JPG, PNG ou WebP.",
    };
  }

  const ext =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/png"
        ? "png"
        : "webp";
  const path = `capas/${crypto.randomUUID()}.${ext}`;

  try {
    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("analises")
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (upErr) {
      return { ok: false, error: upErr.message || "Falha no upload." };
    }

    const { data } = admin.storage.from("analises").getPublicUrl(path);
    const publicUrl = data?.publicUrl?.trim();
    if (!publicUrl) {
      return { ok: false, error: "Não foi possível obter a URL pública." };
    }
    return { ok: true, publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha no upload." };
  }
}

function normalizarSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type CriarAnaliseInput = {
  titulo: string;
  slug: string;
  campeonato: string;
  time_casa: string;
  time_fora: string;
  odd: string;
  confianca: string;
  resumo: string;
  conteudo: string;
  imagem_capa: string;
  status: string;
};

export async function criarAnaliseAction(
  input: CriarAnaliseInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const slug = normalizarSlug(input.slug);
  if (!slug) {
    return { ok: false, error: "Slug inválido." };
  }
  const titulo = String(input.titulo ?? "").trim();
  if (!titulo) {
    return { ok: false, error: "Título é obrigatório." };
  }

  const status: AnaliseStatus =
    String(input.status ?? "").trim() === "publicado"
      ? "publicado"
      : "rascunho";

  const oddNum = parseFloat(String(input.odd ?? "").replace(",", "."));
  const odd = Number.isFinite(oddNum) ? oddNum : 0;

  const confRaw = parseInt(String(input.confianca ?? "").trim(), 10);
  const confianca = Number.isFinite(confRaw)
    ? Math.min(100, Math.max(0, confRaw))
    : 0;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .insert({
        slug,
        titulo,
        campeonato: String(input.campeonato ?? "").trim(),
        time_casa: String(input.time_casa ?? "").trim(),
        time_fora: String(input.time_fora ?? "").trim(),
        odd,
        confianca,
        resumo: String(input.resumo ?? "").trim(),
        conteudo: sanitizeAnaliseHtml(String(input.conteudo ?? "")),
        imagem_capa: String(input.imagem_capa ?? "").trim(),
        status,
      })
      .select("id")
      .single();

    if (error) {
      const msg = error.message || "Erro ao salvar.";
      if (String(error.code) === "23505") {
        return { ok: false, error: "Já existe uma análise com este slug." };
      }
      return { ok: false, error: msg };
    }

    const id = String((data as { id?: unknown })?.id ?? "");
    revalidatePath("/analises");
    revalidatePath(`/analise/${slug}`);
    return { ok: true, id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao salvar." };
  }
}
