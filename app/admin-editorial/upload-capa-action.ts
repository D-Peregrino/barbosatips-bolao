"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

const BUCKET = "analises" as const;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadAnaliseCapaResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

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

/**
 * Upload de capa para o bucket público `analises` (Supabase Storage).
 * Chamado a partir do CMS editorial; requer SUPABASE_SERVICE_ROLE_KEY no servidor.
 */
export async function uploadAnaliseCapaEditorialAction(
  formData: FormData,
): Promise<UploadAnaliseCapaResult> {
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
  if (!ext) {
    return { ok: false, error: "Formato inválido." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, error: "Não foi possível ler o ficheiro." };
  }

  const admin = createAdminClient();
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 10)}.${ext}`;

  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: inferred,
    upsert: false,
  });

  if (upErr) {
    return {
      ok: false,
      error: upErr.message || "Falha no upload. Confirme que o bucket «analises» existe no Supabase.",
    };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  const url = data.publicUrl;
  if (!url) {
    return { ok: false, error: "URL pública indisponível." };
  }

  return { ok: true, url };
}
