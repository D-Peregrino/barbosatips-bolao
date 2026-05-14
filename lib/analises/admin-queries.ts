import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { statusPublicadoNormalizado } from "@/lib/analises/queries";
import type { AnaliseRow } from "@/lib/analises/types";
import { parseStatBlocksPayload } from "@/lib/analises/stat-blocks/parse";
import { siteConfig } from "@/config/site";

const SPORT_SLUG_SET = new Set<string>(siteConfig.sports.map((s) => s.slug));

function inferEsporteFromCategoria(categoria: string): string {
  const c = categoria.trim().toLowerCase();
  if (!c) return "futebol";
  for (const s of siteConfig.sports) {
    if (c.includes(s.slug) || c.includes(s.label.toLowerCase())) return s.slug;
  }
  return "futebol";
}

const COLUNAS =
  "id,slug,titulo,esporte,categoria,tags,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,is_premium,created_at,stat_blocks" as const;

function mapRow(r: Record<string, unknown>): AnaliseRow {
  const prem = r.is_premium;
  const isPremium =
    prem === true ||
    prem === "true" ||
    String(prem ?? "").toLowerCase() === "t";

  let esporte = String(r.esporte ?? "").trim().toLowerCase();
  if (!esporte || !SPORT_SLUG_SET.has(esporte)) {
    esporte = inferEsporteFromCategoria(String(r.categoria ?? ""));
  }
  if (!SPORT_SLUG_SET.has(esporte)) esporte = "futebol";

  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    titulo: String(r.titulo ?? ""),
    esporte,
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
    stat_blocks: parseStatBlocksPayload(r.stat_blocks),
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
