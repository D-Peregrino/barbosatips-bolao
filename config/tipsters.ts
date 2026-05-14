import { siteConfig } from "@/config/site";

/**
 * Perfil público de tipster — registo central para `/tipster/[slug]`.
 * Para múltiplos tipsters: acrescentar entradas e, quando existir `tipster_slug`
 * em `quick_picks` / `analises`, filtrar dados em `lib/tipsters/page-data.ts`.
 */
export type PublicTipsterProfile = {
  slug: string;
  displayName: string;
  /** Nome curto para meta / hero secundário */
  tagline: string;
  bio: string;
  especialidade: string;
  /** Slugs de `siteConfig.sports` */
  sportsSlugs: readonly string[];
  /** Caminho em `public/` ou URL absoluta para OG/hero */
  avatarUrl?: string;
  /**
   * `portal` — agrega todas as quick_picks do portal (v1 BarbosaTips).
   * `by_slug` — reservado: filtrar por campo futuro `tipster_slug === slug`.
   */
  picksScope: "portal" | "by_slug";
};

export const PUBLIC_TIPSTERS: readonly PublicTipsterProfile[] = [
  {
    slug: "barbosa",
    displayName: "Barbosa",
    tagline: "Tipster principal · BarbosaTips",
    bio: "Foco em leitura de mercado, gestão de banca e transparência total em odds e confiança. O padrão editorial do portal — rigor, contexto e zero ruído de cassino.",
    especialidade: "Futebol, basquete (NBA) e mercados principais com valor esperado.",
    sportsSlugs: ["futebol", "basquete", "tenis", "futebol-americano"],
    avatarUrl: "/brand/barbosatips-logo-oficial.png",
    picksScope: "portal",
  },
] as const;

export function listTipsterSlugs(): string[] {
  return PUBLIC_TIPSTERS.map((t) => t.slug);
}

export function getPublicTipster(slug: string): PublicTipsterProfile | null {
  const s = String(slug ?? "").trim().toLowerCase();
  return PUBLIC_TIPSTERS.find((t) => t.slug === s) ?? null;
}

export function tipsterSportsLabels(profile: PublicTipsterProfile): { slug: string; label: string; icon: string }[] {
  return profile.sportsSlugs.map((slug) => {
    const row = siteConfig.sports.find((x) => x.slug === slug);
    return row
      ? { slug: row.slug, label: row.label, icon: row.icon }
      : { slug, label: slug, icon: "⚡" };
  });
}
