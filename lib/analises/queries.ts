import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { AnaliseRow } from "@/lib/analises/types";
import { slugParaConsulta } from "@/lib/analises/slug-query";
import { COLUNAS_ANALISE, mapAnaliseRow } from "@/lib/analises/map-analise-row";
import { ordenarPorPrioridadeDestaque } from "@/lib/analises/destaque";
import { statusPublicadoNormalizado } from "@/lib/analises/status";
import { textoMatchesLiga } from "@/lib/sport-routes";

export { statusPublicadoNormalizado } from "@/lib/analises/status";

const COLUNAS = COLUNAS_ANALISE;

function mapRow(r: Record<string, unknown>): AnaliseRow {
  return mapAnaliseRow(r);
}

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
  return [];
}

/**
 * Destaques editoriais dependiam de colunas opcionais que podem não existir no Supabase.
 * Mantém fallback seguro para não quebrar a home nem /analises.
 */
export async function listarAnalisesDestaqueHomePublicadas(
  soGratis = false,
): Promise<AnaliseRow[]> {
  const rows = await listarUltimasAnalisesPublicadas(12, soGratis);
  return ordenarPorPrioridadeDestaque(rows);
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

/**
 * Análises publicadas filtradas por esporte (coluna `esporte` no Supabase).
 */
export async function listarAnalisesPublicadasPorEsporte(
  esporteSlug: string,
  soGratis = false,
): Promise<AnaliseRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  const slug = String(esporteSlug ?? "").trim().toLowerCase();
  if (!slug) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("analises por esporte", error);
      return [];
    }

    const mapped = (data ?? [])
      .filter((row) =>
        statusPublicadoNormalizado(
          (row as Record<string, unknown>).status,
        ),
      )
      .map((row) => mapRow(row as Record<string, unknown>));

    return aplicarFiltroGratis(mapped, soGratis).filter((row) => row.esporte === slug);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Análises por esporte + competição (texto `campeonato` vs slug/label da liga).
 */
export async function listarAnalisesPublicadasPorEsporteELiga(
  esporteSlug: string,
  leagueSlug: string,
  leagueLabel: string,
  soGratis = false,
): Promise<AnaliseRow[]> {
  const base = await listarAnalisesPublicadasPorEsporte(esporteSlug, soGratis);
  return base.filter((a) =>
    textoMatchesLiga(a.campeonato, leagueSlug, leagueLabel),
  );
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
 * Obtém análise por slug (qualquer status) — CMS / pré-visualização admin.
 */
export async function obterAnalisePorSlug(slug: string): Promise<AnaliseRow | null> {
  if (shouldSkipLiveSupabase()) return null;
  const s = slugParaConsulta(slug);
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

/** Análises publicadas por lista de slugs (favoritos / meu feed). */
export async function listarAnalisesPorSlugs(
  slugs: string[],
  soGratis = false,
): Promise<AnaliseRow[]> {
  const uniq = Array.from(new Set(slugs.map((s) => String(s ?? "").trim()).filter(Boolean)));
  if (shouldSkipLiveSupabase() || uniq.length === 0) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analises")
      .select(COLUNAS)
      .in("slug", uniq)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("analises por slugs", error);
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

/** Análise publicada por slug — portal público /analise/[slug]. */
export async function obterAnalisePublicadaPorSlug(
  slug: string,
): Promise<AnaliseRow | null> {
  const a = await obterAnalisePorSlug(slug);
  if (!a || !statusPublicadoNormalizado(a.status)) return null;
  return a;
}
