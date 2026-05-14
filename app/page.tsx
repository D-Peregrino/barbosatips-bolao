import { AdSlot } from "@/components/ads/AdSlot";
import { FeaturedPicksSection } from "@/components/home/FeaturedPicksSection";
import { SportsRibbon } from "@/components/home/SportsRibbon";
import { SportsTicker } from "@/components/home/SportsTicker";
import { UltimasAnalisesSection } from "@/components/home/UltimasAnalisesSection";
import { PremiumPicksSection } from "@/components/home/PremiumPicksSection";
import { HeroSection } from "@/components/layout/HeroSection";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { TipCard } from "@/components/tips/TipCard";
import type { TipCardData } from "@/components/tips/TipCard";
import {
  listarAnalisesPremiumPublicadas,
  listarUltimasAnalisesPublicadas,
} from "@/lib/analises/queries";
import { buildHomeTickerItems } from "@/lib/home/home-ticker";
import { listarQuickPicksPremium } from "@/lib/picks/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { filtroListagemSoGratis, viewerPodeVerPremium } from "@/lib/premium/types";

const TIPS_MOCK: TipCardData[] = [
  {
    id: "1",
    esporte: "futebol",
    campeonato: "Brasileirão Série A",
    jogo: "Flamengo x Palmeiras",
    mercado: "Resultado Final",
    selecao: "Flamengo vence",
    odd: 2.15,
    confianca: 5,
    horario: "21:30",
    status: "push",
  },
];

export default async function Home() {
  const access = await getPremiumAccess();
  const soGratis = filtroListagemSoGratis(access);
  const ultimasAnalises = await listarUltimasAnalisesPublicadas(3, soGratis);
  const premiumAnalises = await listarAnalisesPremiumPublicadas(4);
  const premiumPicks = await listarQuickPicksPremium(6);
  const viewerPremium = viewerPodeVerPremium(access);
  const tickerItems = buildHomeTickerItems(premiumPicks);

  return (
    <div className="commercial-page-bg text-cream">
      <HeroSection tipsHoje={4} />
      <SportsTicker items={tickerItems} />
      <SportsRibbon kicker="BarbosaTips · ao vivo no mercado" />

      <CommercialPageShell mainClassName="pb-16 pt-6 sm:pt-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <FeaturedPicksSection picks={premiumPicks} viewerCanViewPremium={viewerPremium} />

          <SportsRibbon kicker="Radar editorial">
            <span>Análises com odd sugerida e leitura de confronto.</span>
          </SportsRibbon>

          <UltimasAnalisesSection
            analises={ultimasAnalises}
            viewerCanViewPremium={viewerPremium}
          />

          <div className="hidden sm:block">
            <SportsRibbon kicker="Linha de fundo" className="rounded-xl border-x border-gold-400/12">
              <span className="text-stone-500">
                Transparência · confiança · contexto — identidade BarbosaTips.
              </span>
            </SportsRibbon>
          </div>

          <div className="lg:hidden">
            <AdSlot variant="mobile-inline" intent="sponsor" />
          </div>

          <PremiumPicksSection
            analises={premiumAnalises}
            picks={premiumPicks}
            access={access}
          />

          <div className="hidden lg:flex lg:justify-center">
            <AdSlot variant="card-patrocinado" intent="sponsor" className="max-w-md" />
          </div>

          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <section
            className="commercial-section-strip rounded-2xl border border-gold-400/16 px-4 py-14 sm:py-16"
            aria-labelledby="tips-dia-heading"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400/95">
                    BarbosaTips
                  </p>
                  <h2
                    id="tips-dia-heading"
                    className="mt-2 font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl"
                  >
                    Tips do <span className="text-gold">dia</span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide">
                  <span className="rounded-full border border-gold-400/35 bg-gold-400/10 px-2.5 py-1 text-gold-100">
                    Ao vivo
                  </span>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/12 px-2.5 py-1 text-emerald-200">
                    Green
                  </span>
                  <span className="rounded-full border border-rose-400/40 bg-rose-950/40 px-2.5 py-1 text-rose-100">
                    Red
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {TIPS_MOCK.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </CommercialPageShell>
    </div>
  );
}
