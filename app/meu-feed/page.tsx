import type { Metadata } from "next";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { loadMeuFeedPayload } from "@/lib/engagement/load-meu-feed";
import { MeuFeedClient } from "./MeuFeedClient";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = `Meu feed | ${siteConfig.shortTitle}`;
  const description =
    "Picks e análises favoritas, desportos seguidos e alertas — o teu centro de retenção BarbosaTips.";
  return buildPageMetadata({
    title,
    description,
    path: "/meu-feed",
    keywords: buildKeywordsFromParts(["favoritos", "feed", "notificações", "BarbosaTips"]),
    noindex: true,
  });
}

type Props = { searchParams: Record<string, string | string[] | undefined> };

export default async function MeuFeedPage({ searchParams }: Props) {
  const raw = searchParams.tab;
  const initialTab = Array.isArray(raw) ? raw[0] : raw;
  const data = await loadMeuFeedPayload();
  const access = await getPremiumAccess();

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="commercial-card-elevated mb-10 max-w-4xl border-b border-gold-400/15 p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400/95">Conta · Retenção</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Meu feed</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Favoritos, seguimentos e notificações inteligentes. Arquitetura preparada para push, e-mail e Telegram — ativa
            canais nas preferências.
          </p>
        </header>
        <div className="max-w-5xl">
          <MeuFeedClient initial={data} access={access} initialTab={initialTab} />
        </div>
      </CommercialPageShell>
    </div>
  );
}
