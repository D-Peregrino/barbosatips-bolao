import { AdSlot } from "@/components/ads/AdSlot";
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

  return (
    <div className="commercial-page-bg text-white">
      <HeroSection tipsHoje={4} />

      <CommercialPageShell mainClassName="pb-16 pt-6 sm:pt-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <UltimasAnalisesSection
            analises={ultimasAnalises}
            viewerCanViewPremium={viewerPodeVerPremium(access)}
          />

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
            className="commercial-section-strip rounded-2xl border border-amber-500/15 px-4 py-12 sm:py-14"
            aria-labelledby="tips-dia-heading"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                    BarbosaTips
                  </p>
                  <h2
                    id="tips-dia-heading"
                    className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  >
                    Tips do <span className="text-gold">dia</span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide">
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-amber-200">
                    Ao vivo
                  </span>
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/12 px-2.5 py-1 text-emerald-300">
                    Green
                  </span>
                  <span className="rounded-full border border-red-500/40 bg-red-500/12 px-2.5 py-1 text-red-300">
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
