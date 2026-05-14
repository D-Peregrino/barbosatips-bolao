import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getSiteBaseUrl } from "@/lib/seo/base-url";

function absolutizeOgImage(url?: string | null): string {
  const base = getSiteBaseUrl();
  const fallbackPath = siteConfig.ogImage.startsWith("/") ? siteConfig.ogImage : `/${siteConfig.ogImage}`;
  if (!url?.trim()) return `${base}${fallbackPath}`;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`;
}

export type PageSeoInput = {
  title: string;
  description: string;
  /** Caminho canónico, ex.: `/picks` ou `analises` */
  path: string;
  keywords?: string[];
  ogImage?: string | null;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  twitterCard?: "summary_large_image" | "summary";
  noindex?: boolean;
};

/**
 * Metadata consistente: canonical, OG, Twitter, keywords e robots para Discover.
 */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const base = getSiteBaseUrl();
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const canonical = `${base}${path}`;
  const og = absolutizeOgImage(input.ogImage);
  const twCard = input.twitterCard ?? "summary_large_image";

  return {
    title: input.title,
    description: input.description,
    ...(input.keywords?.length ? { keywords: input.keywords } : {}),
    alternates: { canonical },
    robots: input.noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: input.ogType ?? "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: canonical,
      title: input.title,
      description: input.description,
      images: [{ url: og, width: 1200, height: 630, alt: siteConfig.shortTitle }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: twCard,
      site: siteConfig.twitterHandle,
      title: input.title,
      description: input.description,
      images: [og],
    },
  };
}
