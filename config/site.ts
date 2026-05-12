// ─── CONFIGURAÇÃO GLOBAL DO SITE ─────────────────────────────────────────────
// Altere aqui para atualizar SEO, redes sociais e configurações globais

export const siteConfig = {
  name:        "BarbosaTips",
  title:       "BarbosaTips — Análises e Tips de Apostas Esportivas",
  shortTitle:  "BarbosaTips",
  description:
    "Portal de análises esportivas, tips de apostas com valor esperado positivo, bolões entre amigos e estatísticas avançadas. Futebol, NBA, NFL e mais.",
  url:         "https://www.barbosatips.com.br",
  locale:      "pt_BR",
  language:    "pt-BR",

  // OG / Social
  ogImage:     "/images/og-default.jpg",
  twitterHandle: "@barbosatips",

  // Autores padrão
  author: {
    name:  "BarbosaTips",
    url:   "https://www.barbosatips.com.br",
    email: "contato@barbosatips.com.br",
  },

  // Links de redes sociais
  social: {
    twitter:   "https://twitter.com/barbosatips",
    instagram: "https://instagram.com/barbosatips",
    youtube:   "https://youtube.com/@barbosatips",
    telegram:  "https://t.me/barbosatips",
    whatsapp:  "https://wa.me/5562999999999",
  },

  // Google AdSense
  adsense: {
    publisherId: "ca-pub-XXXXXXXXXXXXXXXX", // Substituir pelo ID real
    slots: {
      headerBanner:  "1234567890",
      sidebarTop:    "0987654321",
      inFeed:        "1111111111",
      articleBottom: "2222222222",
      footer:        "3333333333",
    },
  },

  // Configurações de tips
  tips: {
    stakeLevels: [1, 2, 3, 4, 5] as const, // 1 = mínimo, 5 = máximo
    defaultCurrency: "BRL",
    minOdd: 1.3,
    maxOdd: 10.0,
  },

  // Esportes disponíveis
  sports: [
    { slug: "futebol",  label: "Futebol",    icon: "⚽", color: "#22c55e" },
    { slug: "basquete", label: "Basquete",   icon: "🏀", color: "#f97316" },
    { slug: "futebol-americano", label: "NFL", icon: "🏈", color: "#a855f7" },
    { slug: "tenis",    label: "Tênis",      icon: "🎾", color: "#facc15" },
    { slug: "mma",      label: "MMA / UFC",  icon: "🥊", color: "#ef4444" },
    { slug: "esports",  label: "eSports",    icon: "🎮", color: "#3b82f6" },
  ] as const,

  // Ligas principais (para SEO)
  leagues: {
    futebol: [
      { slug: "brasileirao-serie-a",  label: "Brasileirão Série A" },
      { slug: "copa-do-brasil",       label: "Copa do Brasil" },
      { slug: "libertadores",         label: "Copa Libertadores" },
      { slug: "premier-league",       label: "Premier League" },
      { slug: "champions-league",     label: "Champions League" },
      { slug: "la-liga",              label: "La Liga" },
    ],
    basquete: [
      { slug: "nba",   label: "NBA" },
      { slug: "nbb",   label: "NBB" },
    ],
  },

  // Paginação
  pagination: {
    tipsPerPage:    12,
    analisesPerPage: 9,
    rankingPerPage: 20,
  },

  // Cache ISR (segundos)
  revalidate: {
    tips:    1800,  // 30 min
    analises: 3600, // 1h
    ranking: 900,   // 15 min
    home:    600,   // 10 min
  },
} as const;

// Tipos derivados do config
export type Sport   = typeof siteConfig.sports[number]["slug"];
export type League  = typeof siteConfig.leagues.futebol[number]["slug"];
export type StakeLevel = typeof siteConfig.tips.stakeLevels[number];
