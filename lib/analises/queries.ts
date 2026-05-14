import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseRow } from "@/lib/analises/types";

/** Reconhece publicado com qualquer capitalização ou espaços extra. */
export function statusPublicadoNormalizado(status: unknown): boolean {
  return String(status ?? "").toLowerCase().trim() === "publicado";
}

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

const COLUNAS =
  "id,slug,titulo,categoria,tags,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,is_premium,created_at" as const;

function aplicarFiltroGratis(
  rows: AnaliseRow[],
  soGratis: boolean,
): AnaliseRow[] {
  if (!soGratis) return rows;
  return rows.filter((a) => !a.is_premium);
}

/**
 * Lista análises visíveis em /analises: status normalizado === "publicado".
 * `soGratis`: quando true, exclui `is_premium` (utilizador logado sem assinatura).
 */
export async function listarAnalisesPublicadas(
  soGratis = false,
): Promise<AnaliseRow[]> {
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

    const mapped = (data ?? [])
      .filter((row) =>
        statusPublicadoNormalizado(
          (row as Record<string, unknown>).status,
        ),
      )
      .map((row) => mapRow(row as Record<string, unknown>));

    return aplicarFiltroGratis(mapped, soGratis);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Análises premium publicadas (home / secções).
 */
export async function listarAnalisesPremiumPublicadas(
  limit: number,
): Promise<AnaliseRow[]> {
  if (shouldSkipLiveSupabase() || limit <= 0) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .eq("is_premium", true)
      .order("created_at", { ascending: false })
      .limit(Math.min(limit * 4, 200));

    if (error) {
      console.error("analises listarPremium", error);
      return [];
    }

    return (data ?? [])
      .filter((row) =>
        statusPublicadoNormalizado(
          (row as Record<string, unknown>).status,
        ),
      )
      .map((row) => mapRow(row as Record<string, unknown>))
      .slice(0, limit);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Últimas análises publicadas (ex.: home) — lê um lote recente e filtra no servidor.
 */
export async function listarUltimasAnalisesPublicadas(
  limit: number,
  soGratis = false,
): Promise<AnaliseRow[]> {
  if (shouldSkipLiveSupabase() || limit <= 0) return [];
  const cap = Math.min(Math.max(limit * 25, limit + 20), 200);
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .order("created_at", { ascending: false })
      .limit(cap);

    if (error) {
      console.error("analises listarUltimasPublicadas", error);
      return [];
    }

    const rows = (data ?? [])
      .filter((row) =>
        statusPublicadoNormalizado(
          (row as Record<string, unknown>).status,
        ),
      )
      .map((row) => mapRow(row as Record<string, unknown>));

    return aplicarFiltroGratis(rows, soGratis).slice(0, limit);
  } catch (e) {
    console.error(e);
    return [];
  }
}

const COLUNAS_SITEMAP = "slug,status,created_at" as const;

/** Slugs publicados para `sitemap.xml` (leve). */
export async function listarAnalisesPublicadasParaSitemap(): Promise<
  { slug: string; lastModified: Date }[]
> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS_SITEMAP)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("analises sitemap", error);
      return [];
    }

    return (data ?? [])
      .filter((row) =>
        statusPublicadoNormalizado(
          (row as Record<string, unknown>).status,
        ),
      )
      .map((row) => {
        const r = row as Record<string, unknown>;
        const slug = String(r.slug ?? "").trim();
        const created = String(r.created_at ?? "");
        const t = created ? new Date(created) : new Date();
        return { slug, lastModified: Number.isNaN(t.getTime()) ? new Date() : t };
      })
      .filter((x) => x.slug.length > 0);
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
