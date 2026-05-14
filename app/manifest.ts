import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { BRAND_LOGO_512_WEBP, BRAND_LOGO_OFICIAL_PNG } from "@/lib/brand/assets";

/**
 * Web App Manifest — instalável, tema escuro BarbosaTips, ícones oficiais (`public/brand/`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.title,
    short_name: siteConfig.shortTitle,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#030303",
    theme_color: "#030303",
    categories: ["sports", "entertainment", "lifestyle"],
    lang: "pt-BR",
    dir: "ltr",
    icons: [
      {
        src: BRAND_LOGO_OFICIAL_PNG,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND_LOGO_512_WEBP,
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
