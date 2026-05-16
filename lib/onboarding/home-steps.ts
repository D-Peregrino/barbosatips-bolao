import { siteConfig } from "@/config/site";

export type OnboardingCta = {
  label: string;
  href: string;
  external?: boolean;
  variant?: "gold" | "telegram" | "youtube" | "ghost";
};

export type HomeOnboardingStep = {
  id: string;
  title: string;
  body: string;
  /** Elemento na home para scroll suave + destaque. */
  anchorId?: string;
  ctas?: OnboardingCta[];
};

const { hub } = siteConfig;

export const HOME_ONBOARDING_STEPS: HomeOnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao BarbosaTips",
    body: "Portal de análises, picks rápidas e métricas públicas — tudo num só lugar. Este guia de 1 minuto mostra o essencial.",
  },
  {
    id: "bolao",
    title: "Bolão entre amigos",
    body: "Participa do bolão Copa: palpites por jogo, ranking ao vivo e diversão em grupo. É separado das picks do portal — entra quando quiseres competir com a malta.",
    ctas: [
      { label: "Ver bolão", href: "/bolao", variant: "gold" },
      { label: "Ranking", href: "/ranking", variant: "ghost" },
    ],
  },
  {
    id: "performance",
    title: "Performance transparente",
    body: "ROI, winrate e streaks calculados em público — greens, reds e voids com regras claras (stake 1u). Sem apagar histórico.",
    anchorId: "onboarding-performance",
    ctas: [{ label: "Painel completo", href: "/performance", variant: "gold" }],
  },
  {
    id: "greens",
    title: "Greens e reds",
    body: "Cada pick encerra como GREEN (vitória), RED (derrota) ou VOID (sem efeito na taxa). Vês o resultado nas listagens e no histórico.",
    anchorId: "onboarding-highlights",
    ctas: [{ label: "Ver picks", href: "/picks", variant: "gold" }],
  },
  {
    id: "telegram",
    title: "Telegram — alertas",
    body: "Recebe avisos de picks e novidades no canal oficial. Ideal para não perder linhas antes do jogo.",
    anchorId: "onboarding-community",
    ctas: [
      {
        label: "Abrir Telegram",
        href: hub.telegramCanal,
        external: true,
        variant: "telegram",
      },
    ],
  },
  {
    id: "youtube",
    title: "YouTube — contexto",
    body: "Análises em vídeo e leitura de mercado no canal @CBarbosaTips. Complementa o que lês no site.",
    anchorId: "onboarding-community",
    ctas: [
      {
        label: "Ver canal",
        href: hub.youtubeCanalUrl,
        external: true,
        variant: "youtube",
      },
      { label: "Hub comunidade", href: "/comunidade", variant: "ghost" },
    ],
  },
];
