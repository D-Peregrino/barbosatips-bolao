import SponsorSlot from "@/components/ads/SponsorSlot";
import { HomeLivePortalTeaser } from "@/components/home/HomeLivePortalTeaser";
import { HomeHighlightsGrid } from "@/components/home/HomeHighlightsGrid";
import { HomePerformanceBar } from "@/components/home/HomePerformanceBar";
import { HomePortalHero } from "@/components/home/HomePortalHero";
import { HomePremiumAnalises } from "@/components/home/HomePremiumAnalises";
import { HomeQuickPicksRail } from "@/components/home/HomeQuickPicksRail";
import { HomeSportsHub } from "@/components/home/HomeSportsHub";
import { HomeSectionShell } from "@/components/home/HomeSectionShell";
import { HomeCommunityHubStrip } from "@/components/community/HomeCommunityHubStrip";
import { HomeOnboarding } from "@/components/onboarding/HomeOnboarding";
import { SportsRibbon } from "@/components/home/SportsRibbon";
import { SportsTicker } from "@/components/home/SportsTicker";
import { ActivityPulseTicker } from "@/components/home/ActivityPulseTicker";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import {
  listarAnalisesDestaqueHomePublicadas,
  listarAnalisesPremiumPublicadas,
  listarUltimasAnalisesPublicadas,
} from "@/lib/analises/queries";
import {
  analisesRecentesParaGrid,
  melhoresGreens,
  picksQuentes,
  trendingPicks,
} from "@/lib/home/home-highlights";
import {
  excluirSlugsDaLista,
  resolverDestaquesHomeEditorial,
} from "@/lib/home/home-destaques";
import { HomeDestaquesSecundarios } from "@/components/home/HomeDestaquesSecundarios";
import { buildHomePerformanceSnapshot } from "@/lib/home/home-performance";
import { buildHomeTickerItems } from "@/lib/home/home-ticker";
import { buildLiveSummaryPayload } from "@/lib/live/build-live-summary";
import { listarQuickPicksPerformance, listarQuickPicksRecentes } from "@/lib/picks/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { filtroListagemSoGratis, viewerPodeVerPremium } from "@/lib/premium/types";
import { betaPremiumHref } from "@/lib/beta/cta-hrefs";
import { cn } from "@/lib/utils";

export const revalidate = siteConfig.revalidate.home;

export default async function Home() {
  const access = await getPremiumAccess();
  const soGratis = filtroListagemSoGratis(access);
  const viewerPremium = viewerPodeVerPremium(access);

  const [destaquesHome, ultimas, premiumAnalises, picksHome, picksPerformance] =
    await Promise.all([
      listarAnalisesDestaqueHomePublicadas(soGratis),
      listarUltimasAnalisesPublicadas(12, soGratis),
      listarAnalisesPremiumPublicadas(6),
      listarQuickPicksRecentes(96, soGratis),
      listarQuickPicksPerformance(),
    ]);

  const { principal: featured, secundarios, slugsUsados } =
    resolverDestaquesHomeEditorial(destaquesHome, ultimas);
  const ultimasSemDestaques = excluirSlugsDaLista(ultimas, slugsUsados);
  const gridAnalises = analisesRecentesParaGrid(ultimasSemDestaques, false, 4);
  const quentes = picksQuentes(picksHome, 4);
  const greensTop = melhoresGreens(picksHome, 4);
  const excludeTrending = new Set([...quentes, ...greensTop].map((p) => p.id));
  const trending = trendingPicks(picksHome, 4, excludeTrending);
  const perf = buildHomePerformanceSnapshot(picksPerformance);
  const picksRail = picksHome.slice(0, 14);
  const tickerItems = buildHomeTickerItems(picksHome.slice(0, 12), ultimas.slice(0, 8));
  const liveTeaser = buildLiveSummaryPayload(picksHome, ultimas);

  return (
    <div className="commercial-page-bg text-cream">
      <section className="container-site px-4 pt-5 sm:pt-7 lg:pt-8">
        <div
          className={cn(
            "grid gap-5 sm:gap-6",
            secundarios.length > 0 && "lg:grid-cols-12 lg:items-start lg:gap-8",
          )}
        >
          <div className={secundarios.length > 0 ? "lg:col-span-8" : undefined}>
            <HomePortalHero analise={featured} viewerCanViewPremium={viewerPremium} />
          </div>
          {secundarios.length > 0 ? (
            <aside className="lg:col-span-4">
              <HomeDestaquesSecundarios
                layout="sidebar"
                analises={secundarios}
                viewerCanViewPremium={viewerPremium}
              />
            </aside>
          ) : null}
        </div>
      </section>
      <SportsTicker items={tickerItems} />
      <ActivityPulseTicker lines={liveTeaser.activity} />
      <div id="onboarding-community" className="scroll-mt-onboarding">
        <HomeCommunityHubStrip />
      </div>
      <HomeLivePortalTeaser summary={liveTeaser} />
      <SportsRibbon kicker="BarbosaTips · portal ao vivo" />

      <div className="lg:hidden">
        <CommercialPageShell mainClassName="py-4">
          <SponsorSlot slot="mobileStrip" />
        </CommercialPageShell>
      </div>

      <HomeSectionShell
        id="onboarding-highlights"
        theme="neutral"
        kicker="Radar BarbosaTips"
        title={
          <>
            Destaques do <span className="text-gold-gradient">mercado</span>
          </>
        }
        subtitle="Análises recentes, picks quentes, greens e trending — leitura rápida estilo portal esportivo."
        href="/analises"
        linkLabel="Arquivo editorial"
        className="scroll-mt-onboarding"
      >
        <HomeHighlightsGrid
          embedded
          analises={gridAnalises}
          picksQuentes={quentes}
          melhoresGreens={greensTop}
          trending={trending}
        />
      </HomeSectionShell>

      <CommercialPageShell mainClassName="py-6">
        <div className="hidden md:block">
          <SponsorSlot slot="homeHorizontal" />
        </div>
      </CommercialPageShell>

      <HomeSectionShell
        id="onboarding-performance"
        theme="performance"
        kicker="Track record"
        title={
          <>
            Performance <span className="text-gold-gradient">pública</span>
          </>
        }
        subtitle="ROI, winrate e streak dos últimos 30 dias — stake 1u, voids fora da taxa."
        href="/performance?period=30d"
        linkLabel="Ver painel"
        className="scroll-mt-onboarding"
      >
        <HomePerformanceBar embedded stats={perf} />
      </HomeSectionShell>

      <HomeSectionShell
        theme="picks"
        kicker="Linhas rápidas"
        title={
          <>
            Picks <span className="text-gold-gradient">rápidas</span>
          </>
        }
        subtitle="Odds em destaque · scroll horizontal no mobile"
        href="/picks"
        linkLabel="Ver todas"
        contentBleed
      >
        <HomeQuickPicksRail
          embedded
          picks={picksRail}
          viewerCanViewPremium={viewerPremium}
        />
      </HomeSectionShell>

      <CommercialPageShell mainClassName="py-6">
        <SponsorSlot slot="feedBetween" className="my-2" />
      </CommercialPageShell>

      <HomeSectionShell
        theme="analises"
        kicker="BarbosaTips Premium"
        title={
          <>
            Análises <span className="text-gold-gradient">premium</span>
          </>
        }
        subtitle="Thumbnails grandes, contexto completo e leitura editorial de elite."
        href={betaPremiumHref()}
        linkLabel={
          siteConfig.betaLaunch.enabled &&
          siteConfig.betaLaunch.lockedContentUpsellToLogin
            ? "Entrar"
            : "Ver Premium"
        }
      >
        <HomePremiumAnalises
          embedded
          analises={premiumAnalises}
          viewerCanViewPremium={viewerPremium}
        />
      </HomeSectionShell>

      <CommercialPageShell mainClassName="pb-16 sm:pb-20">
        <HomeSportsHub />
      </CommercialPageShell>

      <HomeOnboarding />
    </div>
  );
}
