"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { isBannerPosition } from "@/lib/banners/types";

const BUCKET = "banners" as const;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const PUBLIC_PATHS = ["/", "/analises", "/picks", "/tips", "/live", "/ranking", "/performance"];

export type UploadBannerResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function revalidateBannerSurfaces() {
  revalidatePath("/admin/banners");
  for (const path of PUBLIC_PATHS) revalidatePath(path);
}

function extensaoPorMime(mime: string): "jpg" | "png" | "webp" | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

function mimePorNomeFicheiro(name: string): string | null {
  const n = name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  return null;
}

function urlHttp(value: FormDataEntryValue | null): string {
  const url = String(value ?? "").trim();
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
}

function parsePrioridade(value: FormDataEntryValue | null): number {
  const n = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

export async function uploadBannerImageAction(formData: FormData): Promise<UploadBannerResult> {
  const gate = await requireAdminActor();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um ficheiro JPG, PNG ou WebP." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Ficheiro demasiado grande (máx. 5 MB)." };
  }

  const rawType = (file.type || "").toLowerCase().trim();
  const inferred = rawType && ALLOWED_MIME.has(rawType) ? rawType : mimePorNomeFicheiro(file.name);
  if (!inferred || !ALLOWED_MIME.has(inferred)) {
    return { ok: false, error: "Formato inválido. Use JPG, PNG ou WebP." };
  }

  const ext = extensaoPorMime(inferred);
  if (!ext) return { ok: false, error: "Formato inválido." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 10)}.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: inferred,
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      error: error.message || "Falha no upload. Confirme que o bucket banners existe.",
    };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl
    ? { ok: true, url: data.publicUrl }
    : { ok: false, error: "URL pública indisponível." };
}

export async function salvarBannerAction(formData: FormData): Promise<void> {
  const gate = await requireAdminActor();
  if (!gate.ok || shouldSkipLiveSupabase()) return;

  const id = String(formData.get("id") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const imagem_url = urlHttp(formData.get("imagem_url"));
  const link_destino = urlHttp(formData.get("link_destino"));
  const posicao = String(formData.get("posicao") ?? "").trim();

  if (!titulo || !imagem_url || !link_destino || !isBannerPosition(posicao)) return;

  const payload = {
    titulo,
    imagem_url,
    link_destino,
    posicao,
    ativo: formData.get("ativo") === "on",
    prioridade: parsePrioridade(formData.get("prioridade")),
  };

  const admin = createAdminClient();
  if (id) {
    await admin.from("banners_publicitarios").update(payload).eq("id", id);
  } else {
    await admin.from("banners_publicitarios").insert(payload);
  }

  revalidateBannerSurfaces();
}

export async function excluirBannerAction(formData: FormData): Promise<void> {
  const gate = await requireAdminActor();
  if (!gate.ok || shouldSkipLiveSupabase()) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const admin = createAdminClient();
  await admin.from("banners_publicitarios").delete().eq("id", id);
  revalidateBannerSurfaces();
}
