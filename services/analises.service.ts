import { createClient } from "@/lib/supabase/server";
import { isSupabaseMock } from "@/lib/supabase/is-mock";
import {
  mockAnalisesGetAll,
  mockAnalisesGetBySlug,
  mockAnalisesGetRelated,
  mockAnalisesGetSlugsForStaticPaths,
} from "@/lib/mock-data";
import type { AnaliseWithTipster, AnaliseFilters, PaginatedResponse } from "@/types/database.types";
import { siteConfig } from "@/config/site";

export const analisesService = {

  async getAll(filters: AnaliseFilters = {}): Promise<PaginatedResponse<AnaliseWithTipster>> {
    if (isSupabaseMock()) return mockAnalisesGetAll(filters);

    const supabase = createClient();
    const {
      esporte, liga, tag, tipster_id, is_premium,
      page = 1,
      per_page = siteConfig.pagination.analisesPerPage,
    } = filters;

    let query = supabase
      .from("analises")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url
        ),
        tip:tips!tip_id (
          id, selecao, odd, stake, resultado
        )
      `, { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (esporte)    query = query.eq("esporte", esporte);
    if (liga)       query = query.eq("liga", liga);
    if (tag)        query = query.contains("tags", [tag]);
    if (tipster_id) query = query.eq("tipster_id", tipster_id);
    if (is_premium !== undefined) query = query.eq("is_premium", is_premium);

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data:    data as AnaliseWithTipster[],
      total:   count ?? 0,
      page,
      perPage: per_page,
      hasMore: (count ?? 0) > page * per_page,
      success: true,
      error:   null,
    };
  },

  async getBySlug(slug: string): Promise<AnaliseWithTipster | null> {
    if (isSupabaseMock()) return mockAnalisesGetBySlug(slug);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("analises")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url
        ),
        tip:tips!tip_id (
          id, selecao, odd, stake, resultado
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) return null;

    // Incrementa views (fire and forget)
    supabase
      .from("analises")
      .update({ views: (data.views ?? 0) + 1 })
      .eq("id", data.id)
      .then(() => {});

    return data as AnaliseWithTipster;
  },

  async getRelated(analise: AnaliseWithTipster, limit = 3): Promise<AnaliseWithTipster[]> {
    if (isSupabaseMock()) return mockAnalisesGetRelated(analise, limit);

    const supabase = createClient();

    const { data } = await supabase
      .from("analises")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url
        ),
        tip:tips!tip_id (
          id, selecao, odd, stake, resultado
        )
      `)
      .eq("status", "published")
      .eq("esporte", analise.esporte)
      .neq("id", analise.id)
      .order("views", { ascending: false })
      .limit(limit);

    return (data ?? []) as AnaliseWithTipster[];
  },

  async getSlugsForStaticPaths(): Promise<string[]> {
    if (isSupabaseMock()) return mockAnalisesGetSlugsForStaticPaths();

    const supabase = createClient();

    const { data } = await supabase
      .from("analises")
      .select("slug")
      .eq("status", "published");

    return (data ?? []).map((a) => a.slug);
  },
};
