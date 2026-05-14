import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { LeadCaptureForm } from "@/components/leads/LeadCaptureForm";
import { BrandShield } from "@/components/brand/BrandShield";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Newsletter · ${siteConfig.shortTitle}`,
    description:
      "Lista BarbosaTips — picks, greens, premium e alertas ao vivo. Segmentação por desporto. Telegram e WhatsApp.",
    path: "/newsletter",
    keywords: buildKeywordsFromParts(["newsletter", "tips", "email", "telegram"]),
  });
}

export default function NewsletterPage() {
  const tg = siteConfig.social.telegram;
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
          <div
            className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl"
            aria-hidden
          />
          <div className="flex flex-wrap items-start gap-4">
            <BrandShield size="md" glow="soft" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400/95">
                Newsletter
              </p>
              <h1 id="cadastro" className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                Lista <span className="text-gold-gradient">inteligente</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
                Escolhe o que recebes e o teu desporto de eleição. Sem spam — só conteúdo alinhado ao
                portal BarbosaTips.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="commercial-card-elevated border p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-white">Inscrição</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Pelo menos uma opção de conteúdo deve ficar activa.
            </p>
            <div className="mt-8">
              <LeadCaptureForm source="newsletter" variant="full" />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="commercial-card-elevated border border-emerald-500/15 p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-emerald-200/95">
                <MessageCircle className="h-4 w-4" aria-hidden />
                Telegram
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Canal rápido para avisos e conversa com a comunidade.
              </p>
              <a
                href={tg}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl bg-[#229ED9] text-sm font-bold text-white transition hover:brightness-110"
              >
                Entrar no Telegram
              </a>
            </div>
            <div className="commercial-card-elevated border border-emerald-600/20 p-5">
              <h3 className="font-display text-sm font-bold text-emerald-100">WhatsApp</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Contacto directo para dúvidas e filas VIP (quando activo).
              </p>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-sm font-bold text-emerald-100 transition hover:bg-emerald-900/50"
              >
                Abrir WhatsApp
              </a>
            </div>
            <Link
              href="/comunidade"
              className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-zinc-400 transition hover:border-gold-400/25 hover:text-gold-200"
            >
              Sobre a comunidade →
            </Link>
          </aside>
        </div>
      </CommercialPageShell>
    </div>
  );
}
