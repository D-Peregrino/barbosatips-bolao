import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseRow } from "@/lib/analises/types";

/** Reconhece publicado com qualquer capitalização ou espaços extra. */
export function statusPublicadoNormalizado(status: unknown): boolean {
  return String(status ?? "").toLowerCase().trim() === "publicado";
}

function mapRow(r: Record<string, unknown>): AnaliseRow {
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
    created_at: String(r.created_at ?? ""),
  };
}

const COLUNAS =
  "id,slug,titulo,categoria,tags,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,created_at" as const;

/**
 * Lista análises visíveis em /analises: status normalizado === "publicado".
 * Usa service role no servidor para não depender do RLS (que compara texto exacto).
 */
export async function listarAnalisesPublicadas(): Promise<AnaliseRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("analises listarPublicadas", error);
      return [];
    }

    return (data ?? [])
      .filter((row) =>
        statusPublicadoNormalizado(
          (row as Record<string, unknown>).status,
        ),
      )
      .map((row) => mapRow(row as Record<string, unknown>));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Obtém análise por slug (qualquer status) — uso em /analise/[slug] durante testes.
 */
export async function obterAnalisePorSlug(slug: string): Promise<AnaliseRow | null> {
  if (shouldSkipLiveSupabase()) return null;
  const s = String(slug ?? "").trim();
  if (!s) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .eq("slug", s)
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

/** @deprecated Use obterAnalisePorSlug — mantido para compatibilidade. */
export async function obterAnalisePublicadaPorSlug(
  slug: string,
): Promise<AnaliseRow | null> {
  return obterAnalisePorSlug(slug);
}
