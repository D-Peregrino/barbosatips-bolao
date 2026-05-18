import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { isBannerPosition, type BannerPosition, type BannerPublicitario } from "@/lib/banners/types";

const BANNER_COLUMNS =
  "id,titulo,imagem_url,link_destino,posicao,ativo,prioridade,click_count,created_at";

function mapBanner(row: Record<string, unknown>): BannerPublicitario | null {
  const posicao = String(row.posicao ?? "");
  if (!isBannerPosition(posicao)) return null;

  return {
    id: String(row.id ?? ""),
    titulo: String(row.titulo ?? ""),
    imagem_url: String(row.imagem_url ?? ""),
    link_destino: String(row.link_destino ?? ""),
    posicao,
    ativo: Boolean(row.ativo),
    prioridade: Number(row.prioridade ?? 0),
    click_count: Number(row.click_count ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

export async function listarBannersAdmin(): Promise<BannerPublicitario[]> {
  noStore();
  if (shouldSkipLiveSupabase()) return [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("banners_publicitarios")
      .select(BANNER_COLUMNS)
      .order("posicao", { ascending: true })
      .order("prioridade", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) return [];
    return ((data ?? []) as Record<string, unknown>[])
      .map(mapBanner)
      .filter((banner): banner is BannerPublicitario => Boolean(banner));
  } catch {
    return [];
  }
}

export async function buscarBannerAtivoPorPosicao(
  posicao: BannerPosition,
): Promise<BannerPublicitario | null> {
  noStore();
  if (shouldSkipLiveSupabase()) return null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("banners_publicitarios")
      .select(BANNER_COLUMNS)
      .eq("posicao", posicao)
      .eq("ativo", true)
      .order("prioridade", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapBanner(data as Record<string, unknown>);
  } catch {
    return null;
  }
}
