import { siteConfig } from "@/config/site";

const SLUGS = siteConfig.sports.map((s) => s.slug);

export type SportSlug = (typeof siteConfig.sports)[number]["slug"];

export function isSportSlug(s: string): s is SportSlug {
  return SLUGS.includes(s as SportSlug);
}

export function slugifyPath(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Liga conhecida no siteConfig (futebol, basquete, …). */
export type LeagueEntry = { slug: string; label: string };

export function getLeaguesForSport(esporte: string): LeagueEntry[] {
  const key = esporte as keyof typeof siteConfig.leagues;
  const block = siteConfig.leagues[key];
  if (!block) return [];
  return block.map((l) => ({ slug: l.slug, label: l.label }));
}

/** Aliases curtos de URL → slug canónico da liga. */
const CAMPEONATO_ALIASES: Record<string, Record<string, string>> = {
  futebol: {
    brasileirao: "brasileirao-serie-a",
    "brasileirao-serie-a": "brasileirao-serie-a",
    seriea: "brasileirao-serie-a",
    libertadores: "libertadores",
    "copa-do-brasil": "copa-do-brasil",
    copadobrasil: "copa-do-brasil",
  },
  basquete: {
    nba: "nba",
    nbb: "nbb",
  },
};

export function resolveCanonicalLeagueSlug(
  esporte: string,
  campeonatoParam: string,
): string | null {
  const p = slugifyPath(campeonatoParam);
  if (!p) return null;
  const leagues = getLeaguesForSport(esporte);
  const direct = leagues.find((l) => l.slug === p);
  if (direct) return direct.slug;
  const alias = CAMPEONATO_ALIASES[esporte]?.[p];
  if (alias && leagues.some((l) => l.slug === alias)) return alias;
  const fuzzy = leagues.find(
    (l) => l.slug.startsWith(p) || p.startsWith(l.slug) || l.slug.includes(p),
  );
  return fuzzy?.slug ?? null;
}

export function getLeagueBySlug(
  esporte: string,
  leagueSlug: string,
): LeagueEntry | null {
  const canonical = resolveCanonicalLeagueSlug(esporte, leagueSlug);
  if (!canonical) return null;
  return getLeaguesForSport(esporte).find((l) => l.slug === canonical) ?? null;
}

export function textoMatchesLiga(
  campeonatoTexto: string,
  leagueSlug: string,
  leagueLabel: string,
): boolean {
  const cs = slugifyPath(campeonatoTexto);
  const ls = leagueSlug.toLowerCase();
  if (cs && cs === ls) return true;
  if (cs && (cs.includes(ls) || ls.includes(cs))) return true;
  const t = campeonatoTexto.trim().toLowerCase();
  const ll = leagueLabel.trim().toLowerCase();
  if (!t || !ll) return false;
  return t === ll || t.includes(ll) || ll.includes(t);
}
