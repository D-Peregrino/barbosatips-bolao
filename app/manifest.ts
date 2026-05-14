import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  BRAND_LOGO_512_WEBP,
  BRAND_LOGO_OFICIAL_PNG,
} from "@/lib/brand/assets";

/**
 * Web App Manifest — PWA refinado (atalhos, ícones any + maskable, tema BarbosaTips).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.title,
    short_name: siteConfig.shortTitle,
    description: siteConfig.description,
    start_url: "/?utm_source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#030303",
    theme_color: "#030303",
    categories: ["sports", "entertainment", "lifestyle"],
    lang: "pt-BR",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND_LOGO_OFICIAL_PNG,
        sizes: "512x512",
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
    shortcuts: [
      {
        name: "Tips do dia",
        short_name: "Tips",
        description: "Tips e prognósticos com stake e contexto.",
        url: "/tips",
        icons: [{ src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Análises",
        short_name: "Análises",
        description: "Análises editoriais com odds e confiança.",
        url: "/analises",
        icons: [{ src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Picks rápidas",
        short_name: "Picks",
        description: "Mercado, odd e confiança em segundos.",
        url: "/picks",
        icons: [{ src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Performance",
        short_name: "Stats",
        description: "Taxa, ROI e gráficos das quick picks.",
        url: "/performance",
        icons: [{ src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
