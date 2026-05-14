import type { AnaliseRow } from "@/lib/analises/types";
import { siteConfig } from "@/config/site";
import { getLeaguesForSport, textoMatchesLiga } from "@/lib/sport-routes";
import type { QuickPickRow } from "@/lib/picks/types";

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbTrailForAnalise(a: AnaliseRow): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Início", path: "/" },
    { name: "Análises", path: "/analises" },
  ];
  const sport = siteConfig.sports.find((s) => s.slug === a.esporte);
  if (sport) {
    items.push({ name: sport.label, path: `/${sport.slug}` });
    const leagues = getLeaguesForSport(a.esporte);
    const match = leagues.find((l) => textoMatchesLiga(a.campeonato, l.slug, l.label));
    if (match) items.push({ name: match.label, path: `/${a.esporte}/${match.slug}` });
    else if (a.campeonato?.trim()) {
      items.push({ name: a.campeonato.trim(), path: `/${a.esporte}` });
    }
  }
  const matchup = [a.time_casa, a.time_fora].filter((x) => x?.trim()).join(" x ");
  items.push({
    name: matchup || a.titulo?.trim() || "Análise",
    path: `/analise/${encodeURIComponent(a.slug)}`,
  });
  return items;
}

export function breadcrumbTrailForPick(pick: QuickPickRow): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Início", path: "/" },
    { name: "Picks", path: "/picks" },
  ];
  const sport = siteConfig.sports.find((s) => s.slug === pick.esporte);
  if (sport) items.push({ name: sport.label, path: `/${sport.slug}` });
  const leagues = getLeaguesForSport(pick.esporte);
  const match = leagues.find((l) => textoMatchesLiga(pick.campeonato, l.slug, l.label));
  if (match) items.push({ name: match.label, path: `/${pick.esporte}/${match.slug}` });
  else if (pick.campeonato?.trim()) {
    items.push({ name: pick.campeonato.trim(), path: `/${pick.esporte}` });
  }
  items.push({
    name: pick.jogo?.trim() || "Pick",
    path: `/pick/${encodeURIComponent(pick.id)}`,
  });
  return items;
}
