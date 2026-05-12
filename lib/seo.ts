import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface SeoParams {
  title?:       string;
  description?: string;
  slug?:        string;
  ogImage?:     string;
  noIndex?:     boolean;
  type?:        "website" | "article";
  publishedAt?: string;
  modifiedAt?:  string;
  tags?:        string[];
}

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────

export function buildMetadata({
  title,
  description,
  slug,
  ogImage,
  noIndex = false,
  type = "website",
  publishedAt,
  tags,
}: SeoParams): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.shortTitle}`
    : siteConfig.title;

  const pageDesc = description ?? siteConfig.description;
  const pageUrl  = slug ? `${siteConfig.url}/${slug}` : siteConfig.url;
  const pageOg   = ogImage ?? siteConfig.ogImage;

  return {
    title:       pageTitle,
    description: pageDesc,
    keywords:    tags ?? [
      "tips apostas", "análises esportivas", "apostas esportivas",
      "tips futebol", "bolão amigos", "tipster",
    ],

    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],

    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      type:        type === "article" ? "article" : "website",
      url:         pageUrl,
      title:       pageTitle,
      description: pageDesc,
      siteName:    siteConfig.name,
      locale:      siteConfig.locale,
      images: [{
        url:    pageOg,
        width:  1200,
        height: 630,
        alt:    pageTitle,
      }],
      ...(type === "article" && publishedAt
        ? { publishedTime: publishedAt }
        : {}),
    },

    twitter: {
      card:        "summary_large_image",
      site:        siteConfig.twitterHandle,
      creator:     siteConfig.twitterHandle,
      title:       pageTitle,
      description: pageDesc,
      images:      [pageOg],
    },
  };
}

// ─── JSON-LD SCHEMAS ─────────────────────────────────────────────────────────

export function articleSchema({
  title,
  description,
  slug,
  publishedAt,
  modifiedAt,
  authorName,
  ogImage,
}: {
  title:       string;
  description: string;
  slug:        string;
  publishedAt: string;
  modifiedAt?: string;
  authorName:  string;
  ogImage?:    string;
}) {
  return {
    "@context":          "https://schema.org",
    "@type":             "Article",
    headline:            title,
    description:         description,
    url:                 `${siteConfig.url}/${slug}`,
    datePublished:       publishedAt,
    dateModified:        modifiedAt ?? publishedAt,
    image:               ogImage ?? siteConfig.ogImage,
    author: {
      "@type": "Person",
      name:    authorName,
      url:     siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name:    siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url:     `${siteConfig.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "@id",
      "@id":   `${siteConfig.url}/${slug}`,
    },
  };
}

export function organizationSchema() {
  return {
    "@context":   "https://schema.org",
    "@type":      "Organization",
    name:         siteConfig.name,
    url:          siteConfig.url,
    logo:         `${siteConfig.url}/images/logo.png`,
    description:  siteConfig.description,
    contactPoint: {
      "@type":       "ContactPoint",
      email:         siteConfig.author.email,
      contactType:   "customer service",
      availableLanguage: "Portuguese",
    },
    sameAs: Object.values(siteConfig.social),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name:      item.name,
      item:      item.url,
    })),
  };
}

// ─── SLUG HELPERS ─────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}
