import type { StatBlocksPayload } from "@/lib/analises/stat-blocks/types";

export type AnaliseStatus = "rascunho" | "publicado";

export type AnaliseRow = {
  id: string;
  slug: string;
  titulo: string;
  /** Slug do esporte (siteConfig.sports), ex.: futebol, basquete. */
  esporte: string;
  categoria: string;
  tags: string;
  campeonato: string;
  time_casa: string;
  time_fora: string;
  odd: string | number;
  confianca: number;
  mercado: string;
  data_jogo: string | null;
  resumo: string;
  conteudo: string;
  imagem_capa: string;
  imagem_url: string;
  status: AnaliseStatus;
  is_premium: boolean;
  conteudo_premium: boolean;
  destaque_principal: boolean;
  destaque_home: boolean;
  prioridade: number;
  created_at: string;
  updated_at: string | null;
  /** Blocos estatísticos premium (JSONB). */
  stat_blocks: StatBlocksPayload;
};

export function oddParaNumero(odd: string | number | null | undefined): number {
  if (odd == null) return 0;
  if (typeof odd === "number" && Number.isFinite(odd)) return odd;
  const n = parseFloat(String(odd).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
