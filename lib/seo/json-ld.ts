import { siteConfig } from "@/config/site";
import { getSiteBaseUrl } from "@/lib/seo/base-url";
import { urlOgPadrao } from "@/lib/analises/seo-analise";
import type { QuickPickRow } from "@/lib/picks/types";
import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";

export type JsonLdThing = Record<string, unknown>;

const base = () => getSiteBaseUrl();

export function jsonLdOrganization(): JsonLdThing {
  return {
    "@type": "Organization",
    "@id": `${base()}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: urlOgPadrao(),
    sameAs: [
      siteConfig.social.twitter,
      siteConfig.social.instagram,
      siteConfig.social.youtube,
      siteConfig.social.telegram,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.author.email,
      contactType: "customer support",
      availableLanguage: ["Portuguese", "pt-BR"],
    },
  };
}

/** WebSite + publisher — útil para painel de marca e Discover. */
export function jsonLdWebSiteWithPublisher(): JsonLdThing {
  return {
    "@type": "WebSite",
    "@id": `${base()}/#website`,
    url: base(),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${base()}/#organization` },
  };
}

export function jsonLdBreadcrumbList(
  items: { name: string; path: string }[],
): JsonLdThing {
  const host = base();
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path.startsWith("http") ? it.path : `${host}${it.path.startsWith("/") ? it.path : `/${it.path}`}`,
    })),
  };
}

/** Evento desportivo genérico a partir de uma quick pick (indexação da página da pick). */
export function jsonLdSportsEventFromPick(pick: QuickPickRow): JsonLdThing {
  const url = `${base()}/pick/${encodeURIComponent(pick.id)}`;
  const start = pick.horario_jogo?.trim();
  return {
    "@type": "SportsEvent",
    "@id": `${url}#event`,
    name: pick.jogo?.trim() || "Confronto",
    description: `${rotuloEsporte(pick.esporte)} — ${pick.mercado} @${pick.odd}`,
    sport: rotuloEsporte(pick.esporte),
    ...(start ? { startDate: start } : {}),
    url,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url,
    },
  };
}

export function jsonLdGraphDocument(graph: JsonLdThing[]): JsonLdThing {
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
