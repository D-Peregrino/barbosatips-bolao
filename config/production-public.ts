/**
 * Variáveis públicas (prefixo NEXT_PUBLIC_) para produção.
 * Definir no Vercel / .env.local — omitir o que não usares.
 *
 * - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — meta tag Search Console
 * - NEXT_PUBLIC_GTM_ID — ex. GTM-XXXXXXX (recomendado carregar o GA4 via GTM)
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID — ex. G-XXXXXXXXXX (só injetado se **não** houver GTM)
 */
export function getPublicProductionConfig(): {
  googleSiteVerification?: string;
  gtmId?: string;
  gaMeasurementId?: string;
} {
  return {
    googleSiteVerification:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() || undefined,
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined,
  };
}
