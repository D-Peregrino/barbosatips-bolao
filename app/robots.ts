import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const base = siteConfig.url.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin-editorial",
          "/admin-editorial/",
          "/admin-picks",
          "/admin-picks/",
          "/admin-leads",
          "/admin-leads/",
          "/acesso-negado",
          "/acesso-negado/",
          "/dashboard/",
          "/api/",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin-editorial",
          "/admin-editorial/",
          "/admin-picks",
          "/admin-picks/",
          "/admin-leads",
          "/admin-leads/",
          "/acesso-negado",
          "/acesso-negado/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
