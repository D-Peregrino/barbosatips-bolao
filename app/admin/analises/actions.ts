"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  verifyAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseStatus } from "@/lib/analises/types";

async function guardAdminAnalises(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const secret = adminAnalisesSessionSecret();
  if (!secret) {
    return { ok: false, error: "Admin de análises não configurado." };
  }
  const token = cookies().get(ADMIN_ANALISES_COOKIE)?.value;
  if (!(await verifyAdminAnalisesCookieValue(token, secret))) {
    return { ok: false, error: "Sessão inválida ou expirada." };
  }
  return { ok: true };
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
  const g = await guardAdminAnalises();
  if (!g.ok) return g;

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
        conteudo: String(input.conteudo ?? "").trim(),
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
