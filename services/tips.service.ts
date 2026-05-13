import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import {
  mockTipsGetAll,
  mockTipsGetById,
  mockTipsGetByTipster,
  mockTipsGetIdsForSitemap,
  mockTipsGetTipsOfTheDay,
} from "@/lib/mock-data";
import type { TipWithTipster, TipFilters, PaginatedResponse } from "@/types/database.types";
import { siteConfig } from "@/config/site";

// ─── TIPS SERVICE ─────────────────────────────────────────────────────────────
// Todas as queries de tips. Usado em Server Components e Route Handlers.

export const tipsService = {

  // Buscar tips paginadas com filtros
  async getAll(filters: TipFilters = {}): Promise<PaginatedResponse<TipWithTipster>> {
    if (shouldSkipLiveSupabase()) return mockTipsGetAll(filters);

    const supabase = createClient();
    const {
      esporte, liga, resultado, tipster_id,
      data_de, data_ate,
      page = 1,
      per_page = siteConfig.pagination.tipsPerPage,
    } = filters;

    let query = supabase
      .from("tips")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url, is_verified
        )
      `, { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (esporte)    query = query.eq("esporte", esporte);
    if (liga)       query = query.eq("liga", liga);
    if (resultado)  query = query.eq("resultado", resultado);
    if (tipster_id) query = query.eq("tipster_id", tipster_id);
    if (data_de)    query = query.gte("partida_data", data_de);
    if (data_ate)   query = query.lte("partida_data", data_ate);

    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      data:     data as TipWithTipster[],
      total:    count ?? 0,
      page,
      perPage:  per_page,
      hasMore:  (count ?? 0) > page * per_page,
      success:  true,
      error:    null,
    };
  },

  // Buscar tips do dia
  async getTipsOfTheDay(): Promise<TipWithTipster[]> {
    if (shouldSkipLiveSupabase()) return mockTipsGetTipsOfTheDay();

    const supabase = createClient();
    const today    = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tips")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url, is_verified
        )
      `)
      .eq("status", "published")
      .gte("partida_data", `${today}T00:00:00`)
      .lte("partida_data", `${today}T23:59:59`)
      .order("stake", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return data as TipWithTipster[];
  },

  // Buscar tip por ID
  async getById(id: string): Promise<TipWithTipster | null> {
    if (shouldSkipLiveSupabase()) return mockTipsGetById(id);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("tips")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url, is_verified
        )
      `)
      .eq("id", id)
      .single();

    if (error) return null;
    return data as TipWithTipster;
  },

  // Tips recentes de um tipster
  async getByTipster(tipsterId: string, limit = 10): Promise<TipWithTipster[]> {
    if (shouldSkipLiveSupabase()) return mockTipsGetByTipster(tipsterId, limit);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("tips")
      .select(`
        *,
        tipster:users!tipster_id (
          id, username, display_name, avatar_url, is_verified
        )
      `)
      .eq("tipster_id", tipsterId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data as TipWithTipster[];
  },

  // Tips para o sitemap
  async getIdsForSitemap(): Promise<{ id: string; updated_at: string }[]> {
    if (shouldSkipLiveSupabase()) return mockTipsGetIdsForSitemap();

    const supabase = createClient();

    const { data } = await supabase
      .from("tips")
      .select("id, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    return (data ?? []).map((t) => ({ id: t.id, updated_at: t.published_at }));
  },
};
