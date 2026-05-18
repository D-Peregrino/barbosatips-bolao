/**
 * Variáveis de ambiente sugeridas para analytics (não ler aqui — documentação única).
 * Ligar no `.env` e instrumentar o layout / eventos conforme o fornecedor.
 */
export const ANALYTICS_ENV_KEYS = {
  googleAnalytics: [
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_GA_DISABLE_PAGE_VIEW", // opcional: "1" para dev
  ],
  googleSearchConsole: ["GSC_SITE_URL", "GSC_SERVICE_ACCOUNT_JSON"], // export API futura
  posthog: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
  plausible: ["NEXT_PUBLIC_PLAUSIBLE_DOMAIN", "NEXT_PUBLIC_PLAUSIBLE_API_HOST"],
} as const;

export type AnalyticsProviderId = keyof typeof ANALYTICS_ENV_KEYS;

export function describeAnalyticsProvider(id: AnalyticsProviderId): string {
  const copy: Record<AnalyticsProviderId, string> = {
    googleAnalytics: "gtag.js ou @next/third-parties/google no root layout.",
    googleSearchConsole: "URL prefix + API Indexing opcional; métricas de impressões/cliques.",
    posthog: "Autocapture + eventos custom (pick_card_open, cta_click).",
    plausible: "Script leve, privacy-first; goals por path.",
  };
  return copy[id];
}
