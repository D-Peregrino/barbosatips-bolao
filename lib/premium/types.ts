export type PremiumAccess = {
  isLoggedIn: boolean;
  isSubscriberPremium: boolean;
};

export function viewerPodeVerPremium(access: PremiumAccess): boolean {
  return access.isSubscriberPremium;
}

/**
 * Listagens: utilizador logado e não assinante só vê itens gratuitos
 * (premium continua acessível na página individual com pré-visualização).
 */
export function filtroListagemSoGratis(access: PremiumAccess): boolean {
  return access.isLoggedIn && !access.isSubscriberPremium;
}
