import { siteConfig } from "@/config/site";
import { buildShortDescription } from "@/lib/seo/auto-seo";

/**
 * Meta description SERP (~160 chars) a partir de fragmentos dinâmicos.
 */
export function buildAutoMetaDescription(parts: (string | undefined | null)[]): string {
  const cleaned = parts.map((p) => String(p ?? "").trim()).filter(Boolean);
  if (!cleaned.length) return siteConfig.description.slice(0, 160);
  return buildShortDescription(cleaned, 160);
}
