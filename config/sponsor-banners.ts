/**
 * Banners de patrocinadores — ficheiros em `public/patrocinadores/`.
 * Para trocar criativos: substitui o ficheiro mantendo o mesmo nome, ou altera `imageFile`.
 */
import { siteConfig } from "@/config/site";

export type SponsorBannerPosition = "horizontal" | "sidebar" | "mobile" | "between-content";

export type SponsorSlotKey =
  | "sidebarDesktop"
  | "homeHorizontal"
  | "mobileStrip"
  | "feedBetween";

export type SponsorSlotConfig = {
  enabled: boolean;
  /** Nome do ficheiro dentro de `public/patrocinadores/` */
  imageFile: string;
  href: string;
  alt: string;
  position: SponsorBannerPosition;
};

export const sponsorBannerSlots: Record<SponsorSlotKey, SponsorSlotConfig> = {
  sidebarDesktop: {
    enabled: true,
    imageFile: "sidebar-desktop.jpg",
    href: "https://www.instagram.com/_marrecoo_/",
    alt: "Marreco Artigos Esportivos",
    position: "sidebar",
  },
  homeHorizontal: {
    enabled: true,
    imageFile: "home-horizontal.jpg",
    href: "https://www.instagram.com/_marrecoo_/",
    alt: "Marreco Artigos Esportivos",
    position: "horizontal",
  },
  mobileStrip: {
    enabled: true,
    imageFile: "mobile-strip.jpg",
    href: "https://www.instagram.com/_marrecoo_/",
    alt: "Marreco Artigos Esportivos",
    position: "mobile",
  },
  feedBetween: {
    enabled: false,
    imageFile: "feed-between.webp",
    href: siteConfig.url,
    alt: "Patrocinador BarbosaTips",
    position: "between-content",
  },
};

export function sponsorPublicPath(imageFile: string): string {
  const safe = imageFile.replace(/^\/+/, "").replace(/\.\./g, "");
  return `/patrocinadores/${safe}`;
}
