import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listTipsterSlugs } from "@/config/tipsters";
import { listarAnalisesPublicadasParaSitemap } from "@/lib/analises/queries";
import { listarQuickPicksParaSitemap } from "@/lib/picks/queries";

const baseUrl = siteConfig.url.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const beta = siteConfig.betaLaunch.enabled;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/tips`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/analises`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/picks`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.85 },
    { url: `${baseUrl}/performance`, lastModified: new Date(), changeFrequency: "daily", priority: 0.82 },
    ...(!beta
      ? ([
          {
            url: `${baseUrl}/inteligencia`,
            lastModified: new Date(),
            changeFrequency: "hourly" as const,
            priority: 0.84,
          },
        ] satisfies MetadataRoute.Sitemap)
      : []),
    { url: `${baseUrl}/live`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/comunidade`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.78 },
    { url: `${baseUrl}/newsletter`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.72 },
    ...(!beta
      ? ([
          { url: `${baseUrl}/premium`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
          { url: `${baseUrl}/vip`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.72 },
        ] satisfies MetadataRoute.Sitemap)
      : []),
    { url: `${baseUrl}/bolao`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/ranking`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/guias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.35 },
    { url: `${baseUrl}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.35 },
  ];

  const sportPages: MetadataRoute.Sitemap = siteConfig.sports.map((s) => ({
    url: `${baseUrl}/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const leaguePagesFutebol: MetadataRoute.Sitemap = siteConfig.leagues.futebol.map((l) => ({
    url: `${baseUrl}/futebol/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const leaguePagesBasquete: MetadataRoute.Sitemap = siteConfig.leagues.basquete.map((l) => ({
    url: `${baseUrl}/basquete/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const analises = await listarAnalisesPublicadasParaSitemap();
  const analisePages: MetadataRoute.Sitemap = analises.map((a) => ({
    url: `${baseUrl}/analise/${encodeURIComponent(a.slug)}`,
    lastModified: a.lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const tipsterPages: MetadataRoute.Sitemap = listTipsterSlugs().map((slug) => ({
    url: `${baseUrl}/tipster/${encodeURIComponent(slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));

  const pickRows = await listarQuickPicksParaSitemap(900);
  const pickPages: MetadataRoute.Sitemap = pickRows.map((p) => ({
    url: `${baseUrl}/pick/${encodeURIComponent(p.id)}`,
    lastModified: p.lastModified,
    changeFrequency: "hourly" as const,
    priority: 0.72,
  }));

  return [
    ...staticPages,
    ...sportPages,
    ...leaguePagesFutebol,
    ...leaguePagesBasquete,
    ...tipsterPages,
    ...pickPages,
    ...analisePages,
  ];
}
