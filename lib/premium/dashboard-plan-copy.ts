import type { PremiumAccess } from "@/lib/premium/types";

export type DashboardPlanSnapshot = {
  headline: string;
  subline: string;
  isSubscriber: boolean;
  loggedIn: boolean;
};

/** Texto estável para a área “Plano” do dashboard (sem chamadas a gateways). */
export function dashboardPlanSnapshot(access: PremiumAccess): DashboardPlanSnapshot {
  if (!access.isLoggedIn) {
    return {
      headline: "Conta convidado",
      subline:
        "Inicia sessão para guardarmos o teu plano e, em breve, ligar Mercado Pago / Stripe à tua assinatura.",
      isSubscriber: false,
      loggedIn: false,
    };
  }
  if (access.isSubscriberPremium) {
    return {
      headline: "VIP / Premium activo",
      subline:
        "Tens leitura integral de análises e picks marcados como premium. Futuras renovações aparecerão aqui.",
      isSubscriber: true,
      loggedIn: true,
    };
  }
  return {
    headline: "Conta gratuita",
    subline:
      "Vês conteúdo público e pré-visualizações premium. Quando os planos estiverem activos, geres tudo nesta área.",
    isSubscriber: false,
    loggedIn: true,
  };
}
