import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { LeadCaptureForm } from "@/components/leads/LeadCaptureForm";
import { BrandShield } from "@/components/brand/BrandShield";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Comunidade · ${siteConfig.shortTitle}`,
    description:
      "Junta-te à comunidade BarbosaTips — newsletter segmentada, Telegram, WhatsApp e conteúdo premium em preparação.",
    path: "/comunidade",
    keywords: buildKeywordsFromParts(["comunidade", "telegram", "tips", "prognósticos"]),
  });
}

export default function ComunidadePage() {
  const tg = siteConfig.social.telegram;
  const wa = siteConfig.social.whatsapp;

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="commercial-card-elevated mb-10 max-w-3xl border p-8 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-gold-400/95">
            <Users className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Comunidade</p>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            O mesmo <span className="text-gold-gradient">rigor</span>, mais perto de ti
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500">
            A newsletter segmenta por desporto (futebol, ténis, NBA…). Os canais sociais servem para
            avisos rápidos e conversa. O email marketing e automações serão ligados na mesma base de
            dados de leads — sem alterar o login actual.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          <section className="commercial-card-elevated border p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <BrandShield size="sm" />
              <h2 className="font-display text-xl font-bold text-white">Entrar na lista</h2>
            </div>
            <LeadCaptureForm source="comunidade" variant="full" />
          </section>

          <div className="space-y-6">
            <section className="commercial-card-elevated border border-white/10 p-6">
              <h3 className="font-display text-lg font-bold text-white">Telegram</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Primeira fila para movimento do portal e links úteis.
              </p>
              <a
                href={tg}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#229ED9] px-6 text-sm font-bold text-white transition hover:brightness-110"
              >
                Telegram BarbosaTips
              </a>
            </section>
            <section className="commercial-card-elevated border border-white/10 p-6">
              <h3 className="font-display text-lg font-bold text-white">WhatsApp</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Canal de contacto e futuras filas comerciais.
              </p>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-6 text-sm font-bold text-emerald-100 transition hover:bg-emerald-900/40"
              >
                WhatsApp
              </a>
            </section>
            <Link
              href="/newsletter"
              className="block text-center text-sm font-semibold text-gold-300 underline-offset-2 hover:underline"
            >
              Página dedicada da newsletter →
            </Link>
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
