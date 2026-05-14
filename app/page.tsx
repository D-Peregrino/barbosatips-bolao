import { AdSlot } from "@/components/ads/AdSlot";
import { HomeLivePortalTeaser } from "@/components/home/HomeLivePortalTeaser";
import { HomeHighlightsGrid } from "@/components/home/HomeHighlightsGrid";
import { HomePerformanceBar } from "@/components/home/HomePerformanceBar";
import { HomePortalHero } from "@/components/home/HomePortalHero";
import { HomePremiumAnalises } from "@/components/home/HomePremiumAnalises";
import { HomeQuickPicksRail } from "@/components/home/HomeQuickPicksRail";
import { HomeSportsHub } from "@/components/home/HomeSportsHub";
import { SportsRibbon } from "@/components/home/SportsRibbon";
import { SportsTicker } from "@/components/home/SportsTicker";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import {
  listarAnalisesPremiumPublicadas,
  listarUltimasAnalisesPublicadas,
} from "@/lib/analises/queries";
import {
  analisesRecentesParaGrid,
  melhoresGreens,
  picksQuentes,
  trendingPicks,
} from "@/lib/home/home-highlights";
import { buildHomePerformanceSnapshot } from "@/lib/home/home-performance";
import { buildHomeTickerItems } from "@/lib/home/home-ticker";
import { buildLiveSummaryPayload } from "@/lib/live/build-live-summary";
import { listarQuickPicksRecentes } from "@/lib/picks/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { filtroListagemSoGratis, viewerPodeVerPremium } from "@/lib/premium/types";

export const revalidate = siteConfig.revalidate.home;

export default async function Home() {
  const access = await getPremiumAccess();
  const soGratis = filtroListagemSoGratis(access);
  const viewerPremium = viewerPodeVerPremium(access);

  const [ultimas, premiumAnalises, picksHome] = await Promise.all([
    listarUltimasAnalisesPublicadas(12, soGratis),
    listarAnalisesPremiumPublicadas(6),
    listarQuickPicksRecentes(96, soGratis),
  ]);

  const featured = ultimas[0] ?? null;
  const gridAnalises = analisesRecentesParaGrid(ultimas, Boolean(featured), 4);
  const quentes = picksQuentes(picksHome, 4);
  const greensTop = melhoresGreens(picksHome, 4);
  const excludeTrending = new Set([...quentes, ...greensTop].map((p) => p.id));
  const trending = trendingPicks(picksHome, 4, excludeTrending);
  const perf = buildHomePerformanceSnapshot(picksHome);
  const picksRail = picksHome.slice(0, 14);
  const tickerItems = buildHomeTickerItems(picksHome.slice(0, 12));
  const liveTeaser = buildLiveSummaryPayload(picksHome, ultimas);

  return (
    <div className="commercial-page-bg text-cream">
      <HomePortalHero analise={featured} viewerCanViewPremium={viewerPremium} />
      <SportsTicker items={tickerItems} />
      <HomeLivePortalTeaser summary={liveTeaser} />
      <SportsRibbon kicker="BarbosaTips · portal ao vivo" />

      <CommercialPageShell mainClassName="pb-20 pt-8 sm:pt-10">
        <div className="space-y-10 sm:space-y-12 lg:space-y-14">
          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <HomeHighlightsGrid
            analises={gridAnalises}
            picksQuentes={quentes}
            melhoresGreens={greensTop}
            trending={trending}
          />

          <div className="hidden md:block">
            <AdSlot variant="banner-horizontal" intent="sponsor" />
          </div>

          <HomePerformanceBar stats={perf} />

          <div className="lg:hidden">
            <AdSlot variant="mobile-inline" intent="ads" />
          </div>

          <SportsRibbon kicker="Picks rápidas">
            <span className="text-stone-500">Odds em destaque · scroll horizontal no mobile</span>
          </SportsRibbon>

          <HomeQuickPicksRail picks={picksRail} viewerCanViewPremium={viewerPremium} />

          <div className="hidden sm:block">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <HomePremiumAnalises
            analises={premiumAnalises}
            viewerCanViewPremium={viewerPremium}
          />

          <div className="hidden lg:flex lg:justify-center">
            <AdSlot variant="card-patrocinado" intent="sponsor" className="max-w-md" />
          </div>

          <HomeSportsHub />

          <div className="md:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
