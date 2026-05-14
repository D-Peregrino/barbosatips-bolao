import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { statusPublicadoNormalizado } from "@/lib/analises/queries";
import type { AnaliseRow } from "@/lib/analises/types";

const COLUNAS =
  "id,slug,titulo,categoria,tags,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,is_premium,created_at" as const;

function mapRow(r: Record<string, unknown>): AnaliseRow {
  const prem = r.is_premium;
  const isPremium =
    prem === true ||
    prem === "true" ||
    String(prem ?? "").toLowerCase() === "t";

  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    titulo: String(r.titulo ?? ""),
    categoria: String(r.categoria ?? ""),
    tags: String(r.tags ?? ""),
    campeonato: String(r.campeonato ?? ""),
    time_casa: String(r.time_casa ?? ""),
    time_fora: String(r.time_fora ?? ""),
    odd: r.odd as string | number,
    confianca: Number(r.confianca ?? 0),
    resumo: String(r.resumo ?? ""),
    conteudo: String(r.conteudo ?? ""),
    imagem_capa: String(r.imagem_capa ?? ""),
    status: statusPublicadoNormalizado(r.status) ? "publicado" : "rascunho",
    is_premium: isPremium,
    created_at: String(r.created_at ?? ""),
  };
}

export async function listarTodasAnalisesAdmin(): Promise<AnaliseRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("admin analises list", error);
      return [];
    }
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/** Uma análise pelo slug (admin / service role). Slug normalizado na query. */
export async function obterAnaliseAdminPorSlug(
  slugParam: string,
): Promise<AnaliseRow | null> {
  if (shouldSkipLiveSupabase()) return null;
  const slug = decodeURIComponent(String(slugParam ?? ""))
    .trim()
    .toLowerCase();
  if (!slug) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("admin analises obterPorSlug", error);
      return null;
    }
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch (e) {
    console.error(e);
    return null;
  }
}
