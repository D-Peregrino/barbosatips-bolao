import { siteConfig } from "@/config/site";
import type { AnaliseRow } from "@/lib/analises/types";
import { tagsAnaliseParaLista } from "@/lib/analises/tags";

const baseUrl = () => siteConfig.url.replace(/\/$/, "");

/** URL canónica da página da análise (alinhada a `/analise/[slug]`). */
export function urlCanonicaAnalise(slug: string): string {
  const s = String(slug ?? "").trim();
  return `${baseUrl()}/analise/${encodeURIComponent(s)}`;
}

/** URL absoluta da imagem de capa (OG / Schema). */
export function urlAbsolutaImagemCapa(a: AnaliseRow): string | null {
  const u = a.imagem_capa?.trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return u.startsWith("/") ? `${baseUrl()}${u}` : `${baseUrl()}/${u}`;
}

export function urlOgPadrao(): string {
  const p = siteConfig.ogImage.startsWith("/")
    ? siteConfig.ogImage
    : `/${siteConfig.ogImage}`;
  return `${baseUrl()}${p}`;
}

/**
 * Título SEO: "{casa} x {fora}: análise, odds e prognóstico | BarbosaTips"
 * (fallback para o título editorial se faltar confronto).
 */
export function tituloSeoAnalise(a: AnaliseRow): string {
  const c = a.time_casa?.trim();
  const f = a.time_fora?.trim();
  const sufixo = ": análise, odds e prognóstico";
  const marca = ` | ${siteConfig.shortTitle}`;
  if (c && f) {
    return `${c} x ${f}${sufixo}${marca}`;
  }
  if (a.titulo?.trim()) {
    return `${a.titulo.trim()}${sufixo}${marca}`;
  }
  return `Análise${sufixo}${marca}`;
}

/** Meta description a partir do resumo (com limite típico SERP). */
export function descricaoSeoAnalise(a: AnaliseRow, max = 160): string {
  const r = (a.resumo?.trim() || siteConfig.description).replace(/\s+/g, " ");
  if (r.length <= max) return r;
  return `${r.slice(0, max - 1).trimEnd()}…`;
}

/** Lista de keywords para `<meta name="keywords">`. */
export function keywordsSeoAnalise(a: AnaliseRow): string[] {
  const set = new Set<string>([
    "BarbosaTips",
    "prognóstico",
    "prognostico",
    "odds",
    "apostas esportivas",
    "análise",
    "analise",
  ]);
  if (a.categoria?.trim()) set.add(a.categoria.trim());
  if (a.campeonato?.trim()) set.add(a.campeonato.trim());
  if (a.time_casa?.trim()) set.add(a.time_casa.trim());
  if (a.time_fora?.trim()) set.add(a.time_fora.trim());
  tagsAnaliseParaLista(a.tags).forEach((t) => set.add(t));
  return Array.from(set);
}

export type ArticleJsonLd = Record<string, unknown>;

export function jsonLdArticleAnalise(a: AnaliseRow): ArticleJsonLd {
  const canonical = urlCanonicaAnalise(a.slug);
  const img = urlAbsolutaImagemCapa(a);
  const images = img ? [img] : [urlOgPadrao()];

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.titulo || tituloSeoAnalise(a),
    description: descricaoSeoAnalise(a, 300),
    image: images,
    datePublished: a.created_at || undefined,
    author: {
      "@type": "Organization",
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: urlOgPadrao(),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,
    articleSection: a.categoria?.trim() || a.campeonato?.trim() || "Análises",
    keywords: keywordsSeoAnalise(a).join(", "),
  };
}
