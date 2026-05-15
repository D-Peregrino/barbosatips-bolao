import type { Metadata } from "next";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { AnalisesPortal } from "@/components/analises/portal/AnalisesPortal";
import { PortalSocialCtaBand } from "@/components/portal/PortalSocialCtaBand";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { listarAnalisesPublicadas } from "@/lib/analises/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { filtroListagemSoGratis, viewerPodeVerPremium } from "@/lib/premium/types";
import { buildAutoMetaDescription } from "@/lib/seo/auto-meta-description";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lista = await listarAnalisesPublicadas();
  const n = lista.length;
  const primary = lista[0];

  const baseTitle = `Prognósticos e análises esportivas | ${siteConfig.shortTitle}`;
  const title = primary
    ? `${primary.titulo.length > 58 ? `${primary.titulo.slice(0, 58)}…` : primary.titulo} | ${siteConfig.shortTitle}`
    : baseTitle;

  const description = buildAutoMetaDescription([
    n > 0 ? `${n} ${n === 1 ? "análise" : "análises"} com odds e contexto` : "prognósticos editoriais",
    primary?.titulo,
    primary?.campeonato,
    "confiança, mercados e leitura BarbosaTips",
  ]);

  const capa = primary?.imagem_capa?.trim();
  const ogImageUrl = capa
    ? capa.startsWith("http://") || capa.startsWith("https://")
      ? capa
      : `${siteConfig.url.replace(/\/$/, "")}${capa.startsWith("/") ? capa : `/${capa}`}`
    : null;
  const ogImages = ogImageUrl
    ? [{ url: ogImageUrl, width: 1200, height: 630, alt: primary?.titulo ?? siteConfig.shortTitle }]
    : undefined;

  const keywords = buildKeywordsFromParts([
    "análises",
    "prognósticos",
    primary?.campeonato,
    primary?.categoria,
    primary?.titulo,
  ]);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${siteConfig.url}/analises` },
    openGraph: {
      title: primary ? `${primary.titulo} | ${siteConfig.name}` : baseTitle,
      description,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: `${siteConfig.url}/analises`,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: primary ? `${primary.titulo} | ${siteConfig.name}` : baseTitle,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function AnalisesPage() {
  const access = await getPremiumAccess();
  const data = await listarAnalisesPublicadas(filtroListagemSoGratis(access));

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,.14),transparent_50%)]" />

      <CommercialPageShell>
        <div className="w-full min-w-0">
          <div className="mb-8 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <header className="commercial-card-elevated mb-12 max-w-3xl border-b border-amber-500/15 p-6 pb-8 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Editorial · Prognósticos
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Portal de <span className="text-gold">análises</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Prognósticos com odd sugerida, nível de confiança e resumo editorial — o
              mesmo padrão visual premium BarbosaTips em cada confronto.
            </p>
          </header>

          <SponsorSlot slot="feedBetween" className="mb-10" />

          <AnalisesPortal
            analises={data}
            viewerCanViewPremium={viewerPodeVerPremium(access)}
          />

          <div className="mt-12">
            <PortalSocialCtaBand />
          </div>

          <div className="mt-10 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
