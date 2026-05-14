import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { TipsterAnalisesSection } from "@/components/tipster/TipsterAnalisesSection";
import { TipsterChartsSection } from "@/components/tipster/TipsterChartsSection";
import { TipsterHero } from "@/components/tipster/TipsterHero";
import { TipsterKpiStrip } from "@/components/tipster/TipsterKpiStrip";
import { TipsterLeaderboards } from "@/components/tipster/TipsterLeaderboards";
import { TipsterPicksSection } from "@/components/tipster/TipsterPicksSection";
import { siteConfig } from "@/config/site";
import { getPublicTipster, listTipsterSlugs } from "@/config/tipsters";
import { loadTipsterPageData } from "@/lib/tipsters/page-data";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { viewerPodeVerPremium } from "@/lib/premium/types";

const base = siteConfig.url.replace(/\/$/, "");

type Props = { params: { slug: string } };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listTipsterSlugs().map((slug) => ({ slug }));
}

export const revalidate = siteConfig.revalidate.home;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = getPublicTipster(params.slug);
  if (!profile) {
    return { title: `Tipster · ${siteConfig.shortTitle}` };
  }
  const title = `${profile.displayName} · Tipster · ${siteConfig.shortTitle}`;
  const description =
    `${profile.tagline} — ${profile.bio}`.slice(0, 160) || siteConfig.description;
  const canonical = `${base}/tipster/${encodeURIComponent(profile.slug)}`;
  const ogImage = profile.avatarUrl?.startsWith("/")
    ? `${base}${profile.avatarUrl}`
    : profile.avatarUrl ?? `${base}${siteConfig.ogImage}`;

  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: canonical,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: profile.displayName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      site: siteConfig.twitterHandle,
    },
  };
}

export default async function TipsterProfilePage({ params }: Props) {
  const data = await loadTipsterPageData(params.slug, { analisesLimit: 9 });
  if (!data) notFound();

  const access = await getPremiumAccess();
  const viewerPremium = viewerPodeVerPremium(access);

  return (
    <div className="commercial-page-bg text-cream">
      <TipsterHero profile={data.profile} />

      <CommercialPageShell mainClassName="pb-20 pt-8 sm:pt-10">
        <div className="space-y-10 sm:space-y-12">
          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <TipsterKpiStrip snapshot={data.snapshot} />

          <div className="hidden md:block">
            <AdSlot variant="banner-horizontal" intent="sponsor" />
          </div>

          <TipsterChartsSection
            roiSeries={data.roiSeries}
            monthly={data.monthly}
            history={data.historyPicks}
          />

          <TipsterLeaderboards markets={data.bestMarkets} sports={data.bestSports} />

          <div className="lg:hidden">
            <AdSlot variant="mobile-inline" intent="ads" />
          </div>

          <TipsterPicksSection picks={data.lastPicks} viewerCanViewPremium={viewerPremium} />

          <TipsterAnalisesSection analises={data.lastAnalises} viewerCanViewPremium={viewerPremium} />

          <div className="hidden lg:flex lg:justify-center">
            <AdSlot variant="card-patrocinado" intent="sponsor" className="max-w-md" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
