import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Send, Youtube } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { BrandShield } from "@/components/brand/BrandShield";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Comunidade · ${siteConfig.shortTitle}`,
    description:
      "Segue o BarbosaTips no Telegram, YouTube e WhatsApp — picks, análises e avisos da equipa.",
    path: "/newsletter",
    keywords: buildKeywordsFromParts(["comunidade", "telegram", "youtube", "tips"]),
  });
}

export default function NewsletterPage() {
  const { hub } = siteConfig;
  const wa = siteConfig.social.whatsapp;

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -15%, rgba(201, 162, 39, 0.14), transparent 50%)",
        }}
        aria-hidden
      />

      <CommercialPageShell>
        <header className="commercial-card-elevated relative mb-10 max-w-3xl overflow-hidden border p-8 sm:p-10">
          <div className="flex flex-wrap items-start gap-4">
            <BrandShield size="md" glow="soft" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400/95">
                Comunidade
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                Segue o <span className="text-gold-gradient">portal</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
                Avisos, picks e conversa com a equipa — nos canais oficiais Telegram, YouTube e
                WhatsApp.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="commercial-card-elevated border border-sky-500/15 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-sky-100">
              <Send className="h-5 w-5" aria-hidden />
              Telegram
            </h2>
            <p className="mt-2 text-sm text-zinc-500">Canal e grupo para avisos e comunidade.</p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={hub.telegramCanal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#229ED9] text-sm font-bold text-white transition hover:brightness-110"
              >
                Canal oficial
              </a>
              <a
                href={hub.telegramGrupo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-sky-400/35 bg-sky-950/30 text-sm font-bold text-sky-100 transition hover:border-sky-300/55"
              >
                Grupo da comunidade
              </a>
            </div>
          </div>

          <div className="commercial-card-elevated border border-red-500/15 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-red-100">
              <Youtube className="h-5 w-5" aria-hidden />
              YouTube
            </h2>
            <p className="mt-2 text-sm text-zinc-500">Vídeos, prévias e conteúdo editorial.</p>
            <a
              href={hub.youtubeCanalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl border border-red-500/35 bg-red-950/35 text-sm font-bold text-red-50 transition hover:bg-red-950/50"
            >
              Ver canal
            </a>
          </div>

          <div className="commercial-card-elevated border border-emerald-600/20 p-6 sm:col-span-2 lg:col-span-1">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-emerald-100">
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp
            </h2>
            <p className="mt-2 text-sm text-zinc-500">Contacto directo para dúvidas.</p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-sm font-bold text-emerald-100 transition hover:bg-emerald-900/50"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/comunidade" className="font-semibold text-gold-300 hover:underline">
            Ver hub completo da comunidade →
          </Link>
        </p>
      </CommercialPageShell>
    </div>
  );
}
