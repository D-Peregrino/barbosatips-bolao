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
  resumo: string;
  conteudo: string;
  imagem_capa: string;
  status: AnaliseStatus;
  is_premium: boolean;
  created_at: string;
};

export function oddParaNumero(odd: string | number | null | undefined): number {
  if (odd == null) return 0;
  if (typeof odd === "number" && Number.isFinite(odd)) return odd;
  const n = parseFloat(String(odd).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
