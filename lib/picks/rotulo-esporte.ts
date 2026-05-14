import { siteConfig } from "@/config/site";

export function rotuloEsporte(slug: string): string {
  const s = siteConfig.sports.find((x) => x.slug === slug);
  return s?.label ?? slug;
}

export function iconeEsporte(slug: string): string {
  const s = siteConfig.sports.find((x) => x.slug === slug);
  return s?.icon ?? "⚡";
}
