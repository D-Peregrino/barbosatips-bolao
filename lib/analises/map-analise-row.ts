import type { AnaliseRow } from "@/lib/analises/types";
import { parseBoolCol } from "@/lib/analises/parse-columns";
import { parseStatBlocksPayload } from "@/lib/analises/stat-blocks/parse";
import { statusPublicadoNormalizado } from "@/lib/analises/status";
import { siteConfig } from "@/config/site";

export { parseBoolCol } from "@/lib/analises/parse-columns";

const SPORT_SLUG_SET = new Set<string>(siteConfig.sports.map((s) => s.slug));

function inferEsporteFromCategoria(categoria: string): string {
  const c = categoria.trim().toLowerCase();
  if (!c) return "futebol";
  for (const s of siteConfig.sports) {
    if (c.includes(s.slug) || c.includes(s.label.toLowerCase())) return s.slug;
  }
  return "futebol";
}

export const COLUNAS_ANALISE =
  "id,titulo,slug,resumo,conteudo,status,created_at,published_at,updated_at,campeonato,tag,confianca,imagem_url,data_jogo,odd,mercado,destaque_principal,destaque_home,prioridade,conteudo_premium" as const;

export function mapAnaliseRow(r: Record<string, unknown>): AnaliseRow {
  const isPremium = parseBoolCol(r.conteudo_premium ?? r.is_premium);

  let esporte = String(r.esporte ?? "").trim().toLowerCase();
  if (!esporte || !SPORT_SLUG_SET.has(esporte)) {
    esporte = inferEsporteFromCategoria(String(r.categoria ?? r.tag ?? ""));
  }
  if (!SPORT_SLUG_SET.has(esporte)) esporte = "futebol";

  const tag = String(r.tag ?? r.tags ?? r.categoria ?? "");

  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    titulo: String(r.titulo ?? ""),
    esporte,
    categoria: String(r.categoria ?? tag),
    tags: tag,
    campeonato: String(r.campeonato ?? ""),
    time_casa: String(r.time_casa ?? ""),
    time_fora: String(r.time_fora ?? ""),
    odd: r.odd as string | number,
    confianca: Number(r.confianca ?? 0),
    mercado: String(r.mercado ?? ""),
    data_jogo: r.data_jogo ? String(r.data_jogo) : null,
    resumo: String(r.resumo ?? ""),
    conteudo: String(r.conteudo ?? ""),
    imagem_capa: String(r.imagem_url ?? ""),
    imagem_url: String(r.imagem_url ?? ""),
    status: statusPublicadoNormalizado(r.status) ? "publicado" : "rascunho",
    is_premium: isPremium,
    conteudo_premium: parseBoolCol(r.conteudo_premium),
    destaque_principal: parseBoolCol(r.destaque_principal),
    destaque_home: parseBoolCol(r.destaque_home),
    prioridade: Number(r.prioridade ?? 0),
    created_at: String(r.created_at ?? ""),
    updated_at: r.updated_at ? String(r.updated_at) : null,
    stat_blocks: parseStatBlocksPayload(r.stat_blocks),
  };
}
