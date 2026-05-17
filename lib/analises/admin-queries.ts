import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { slugParaConsulta } from "@/lib/analises/slug-query";
import { COLUNAS_ANALISE, mapAnaliseRow } from "@/lib/analises/map-analise-row";
import type { AnaliseRow } from "@/lib/analises/types";

const COLUNAS = COLUNAS_ANALISE;

function mapRow(r: Record<string, unknown>): AnaliseRow {
  return mapAnaliseRow(r);
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
  const slug = slugParaConsulta(slugParam);
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
