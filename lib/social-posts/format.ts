import { siteConfig } from "@/config/site";
import type { SocialLinks } from "@/lib/social-posts/types";

export function truncateTwitter(text: string, max = 280): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function formatOdd(odd: number): string {
  return `@${odd.toFixed(2)}`;
}

export function formatPct(v: number | null): string {
  if (v == null) return "—";
  return `${v}%`;
}

export function buildSocialLinks(): SocialLinks {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    site: base,
    picks: `${base}/picks`,
    performance: `${base}/performance`,
    telegram: siteConfig.hub.telegramPicks || siteConfig.social.telegram,
    youtube: siteConfig.hub.youtubeCanalUrl || siteConfig.social.youtube,
    instagram: siteConfig.social.instagram,
  };
}

export function formatHorarioBr(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
