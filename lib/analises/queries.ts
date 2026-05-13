import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseRow } from "@/lib/analises/types";

function mapRow(r: Record<string, unknown>): AnaliseRow {
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    titulo: String(r.titulo ?? ""),
    campeonato: String(r.campeonato ?? ""),
    time_casa: String(r.time_casa ?? ""),
    time_fora: String(r.time_fora ?? ""),
    odd: r.odd as string | number,
    confianca: Number(r.confianca ?? 0),
    resumo: String(r.resumo ?? ""),
    conteudo: String(r.conteudo ?? ""),
    imagem_capa: String(r.imagem_capa ?? ""),
    status: r.status === "publicado" ? "publicado" : "rascunho",
    created_at: String(r.created_at ?? ""),
  };
}

export async function listarAnalisesPublicadas(): Promise<AnaliseRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const sb = createClient();
    const { data, error } = await sb
      .from("analises")
      .select(
        "id,slug,titulo,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,created_at",
      )
      .eq("status", "publicado")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("analises listarPublicadas", error);
      return [];
    }
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function obterAnalisePublicadaPorSlug(
  slug: string,
): Promise<AnaliseRow | null> {
  if (shouldSkipLiveSupabase()) return null;
  const s = String(slug ?? "").trim();
  if (!s) return null;
  try {
    const sb = createClient();
    const { data, error } = await sb
      .from("analises")
      .select(
        "id,slug,titulo,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,created_at",
      )
      .eq("slug", s)
      .eq("status", "publicado")
      .maybeSingle();

    if (error) {
      console.error("analises obterPorSlug", error);
      return null;
    }
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch (e) {
    console.error(e);
    return null;
  }
}
