import { siteConfig } from "@/config/site";

/** CTAs de upsell (premium/VIP) na fase beta → login; depois do beta, rotas de produto. */
export function betaPremiumHref(): string {
  return siteConfig.betaLaunch.enabled && siteConfig.betaLaunch.lockedContentUpsellToLogin
    ? "/login"
    : "/premium";
}

export function betaVipHref(): string {
  return siteConfig.betaLaunch.enabled && siteConfig.betaLaunch.lockedContentUpsellToLogin
    ? "/login"
    : "/vip";
}

/**
 * Link para “saber mais” sobre VIP quando a rota `/vip` está oculta/redirecionada no beta.
 * Mantém upsells de conteúdo bloqueado em `betaVipHref` (login).
 */
export function betaVipPageHref(): string {
  return siteConfig.betaLaunch.enabled && siteConfig.betaLaunch.hideVipNav
    ? "/comunidade"
    : "/vip";
}
