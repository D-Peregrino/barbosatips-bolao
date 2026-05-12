// app/sitemap.ts
import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// tipsService removido — sem Supabase ainda.
// Adicionar de volta quando o banco estiver conectado.

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                  lastModified: new Date(), changeFrequency: "hourly", priority: 1    },
    { url: `${baseUrl}/tips`,        lastModified: new Date(), changeFrequency: "hourly", priority: 0.9  },
    { url: `${baseUrl}/analises`,    lastModified: new Date(), changeFrequency: "daily",  priority: 0.9  },
    { url: `${baseUrl}/bolao`,       lastModified: new Date(), changeFrequency: "daily",  priority: 0.8  },
    { url: `${baseUrl}/ranking`,     lastModified: new Date(), changeFrequency: "daily",  priority: 0.8  },
    { url: `${baseUrl}/guias`,       lastModified: new Date(), changeFrequency: "weekly", priority: 0.7  },
    { url: `${baseUrl}/estatisticas`,lastModified: new Date(), changeFrequency: "daily",  priority: 0.7  },
  ];

  const sportPages: MetadataRoute.Sitemap = siteConfig.sports.map((s) => ({
    url:             `${baseUrl}/${s.slug}`,
    lastModified:    new Date(),
    changeFrequency: "daily" as const,
    priority:        0.8,
  }));

  const leaguePages: MetadataRoute.Sitemap = siteConfig.leagues.futebol.map((l) => ({
    url:             `${baseUrl}/futebol/${l.slug}`,
    lastModified:    new Date(),
    changeFrequency: "daily" as const,
    priority:        0.75,
  }));

  return [...staticPages, ...sportPages, ...leaguePages];
}