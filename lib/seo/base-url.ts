import { siteConfig } from "@/config/site";

/** URL base do site, sem barra final. */
export function getSiteBaseUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}
