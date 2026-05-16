import type { Metadata } from "next";
import Link from "next/link";
import {
  Instagram,
  MessageCircle,
  Send,
  Sparkles,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { buildAutoMetaDescription } from "@/lib/seo/auto-meta-description";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import {
  ComunidadeRoadmapSection,
  ComunidadeYoutubeSection,
} from "@/components/community/ComunidadeHubSections";

export async function generateMetadata(): Promise<Metadata> {
  const description = buildAutoMetaDescription([
    "Hub oficial BarbosaTips",
    "Telegram canal e grupo",
    "YouTube com análises e shorts",
    "Instagram, X, newsletter e roadmap da comunidade",
  ]);
  return buildPageMetadata({
    title: `Comunidade · ${siteConfig.shortTitle}`,
    description,
    path: "/comunidade",
    keywords: buildKeywordsFromParts([
      "comunidade",
      "telegram",
      "youtube",
      "tips",
      "prognósticos",
      "BarbosaTips",
    ]),
  });
}

const benefits = [
  {
    title: "Alertas em tempo real",
    body: "Telegram para avisos rápidos, movimento de linhas e links úteis sem ruído de algoritmo.",
  },
  {
    title: "Análises em vídeo",
    body: "YouTube com leitura de confronto, resumos e shorts — o mesmo rigor editorial em formato visual.",
  },
  {
    title: "Rede consolidada",
    body: "Instagram e X para destaques visuais e threads — o site junta tudo num só sítio.",
  },
  {
    title: "Sem feed tóxico",
    body: "Sem comentários internos por agora: conversa continua nos canais onde a comunidade já vive.",
  },
] as const;

export default function ComunidadePage() {
  const { hub, social } = siteConfig;

  const redes = [
    { href: hub.telegramCanal, label: "Canal Telegram", icon: Send, tone: "text-[#54b4e8]" },
    { href: hub.telegramGrupo, label: "Grupo Telegram", icon: Users, tone: "text-sky-300" },
    { href: hub.youtubeCanalUrl, label: "YouTube", icon: Youtube, tone: "text-red-400" },
    { href: social.instagram, label: "Instagram", icon: Instagram, tone: "text-pink-400" },
    { href: social.twitter, label: "X (Twitter)", icon: Twitter, tone: "text-zinc-300" },
    { href: social.whatsapp, label: "WhatsApp", icon: MessageCircle, tone: "text-emerald-400" },
  ] as const;

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(201,162,39,.12),transparent_55%)]"
        aria-hidden
      />
      <CommercialPageShell>
        <header className="commercial-card-elevated relative overflow-hidden border p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-400/5 blur-3xl" aria-hidden />
          <div className="relative flex flex-wrap items-center gap-3 text-gold-400/95">
            <Sparkles className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Hub da comunidade</p>
          </div>
          <h1 className="relative mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            O teu <span className="text-gold-gradient">centro de comando</span> BarbosaTips
          </h1>
          <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Canal e grupo no Telegram, análises no YouTube e redes sociais — tudo ligado ao mesmo
            rigor esportivo. A newsletter continua aqui; o bolão mantém-se como está.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <a
              href={hub.telegramCanal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-6 text-sm font-bold text-white shadow-lg shadow-[#229ED9]/20 transition hover:brightness-110"
            >
              <Send className="h-4 w-4" aria-hidden />
              Entrar na comunidade
            </a>
            <a
              href={hub.youtubeCanalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-950/35 px-6 text-sm font-bold text-red-50 transition hover:border-red-400/55"
            >
              <Youtube className="h-4 w-4" aria-hidden />
              Assistir no YouTube
            </a>
            <Link
              href="/newsletter"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gold-400/30 bg-black/40 px-6 text-sm font-semibold text-gold-100 transition hover:border-gold-300/50"
            >
              Newsletter
            </Link>
          </div>
        </header>

        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Redes e canais</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Escolhe o canal que preferes — o site é o mapa; a ação continua onde a malta já está.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {redes.map(({ href, label, icon: Icon, tone }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full min-h-[120px] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#14120e]/95 to-[#080706] p-5 transition hover:border-gold-400/25 hover:shadow-[0_20px_50px_-28px_rgba(201,162,39,.12)]"
                >
                  <Icon className={`h-7 w-7 ${tone}`} strokeWidth={1.75} aria-hidden />
                  <span className="mt-4 font-display text-base font-bold text-white transition group-hover:text-gold-200">
                    {label}
                  </span>
                  <span className="mt-1 text-xs text-zinc-600">Abre em novo separador</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
            Benefícios de estar na comunidade
          </h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {benefits.map((b) => (
              <li
                key={b.title}
                className="rounded-2xl border border-[#3d3420]/80 bg-[#0c0b09]/80 p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,.75)]"
              >
                <p className="font-display text-lg font-bold text-gold-200/95">{b.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{b.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16">
          <ComunidadeYoutubeSection />
        </div>

        <div className="mt-16">
          <ComunidadeRoadmapSection />
        </div>

        <div className="mt-16">
          <div className="flex max-w-xl flex-col justify-center gap-6 rounded-2xl border border-gold-400/15 bg-gradient-to-br from-[#1a1610] to-[#080706] p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
                Ação imediata
              </p>
              <p className="mt-2 font-display text-lg font-bold text-white">Grupo Telegram</p>
              <p className="mt-2 text-sm text-zinc-500">
                Troca de ideias e avisos da equipa — convites e regras são partilhados no próprio
                Telegram.
              </p>
            </div>
            <a
              href={hub.telegramGrupo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-sky-400/35 bg-sky-950/30 px-6 text-sm font-bold text-sky-100 transition hover:border-sky-300/55"
            >
              <Users className="h-4 w-4" aria-hidden />
              Entrar no grupo
            </a>
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
