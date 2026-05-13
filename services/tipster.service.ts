import { createClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { mockTipsterGetByUsername, mockTipsterGetRanking } from "@/lib/mock-data";
import type { TipsterPublico } from "@/types/database.types";

export const tipsterService = {

  async getRanking(limit = 50): Promise<TipsterPublico[]> {
    if (shouldSkipLiveSupabase()) return mockTipsterGetRanking(limit);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        stats:tipster_stats!user_id (*)
      `)
      .eq("role", "tipster")
      .order("tipster_stats.roi", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data as TipsterPublico[];
  },

  async getByUsername(username: string): Promise<TipsterPublico | null> {
    if (shouldSkipLiveSupabase()) return mockTipsterGetByUsername(username);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        stats:tipster_stats!user_id (*),
        tips_recentes:tips (
          id, esporte, liga, partida, selecao, odd, stake, resultado, published_at
        )
      `)
      .eq("username", username)
      .eq("role", "tipster")
      .single();

    if (error) return null;
    return data as TipsterPublico;
  },
};
