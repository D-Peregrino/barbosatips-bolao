import { UltimasAnalisesSection } from "@/components/home/UltimasAnalisesSection";
import { PremiumPicksSection } from "@/components/home/PremiumPicksSection";
import { HeroSection } from "@/components/layout/HeroSection";
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
    <main className="min-h-screen bg-black text-white">
      <HeroSection tipsHoje={4} />

      <UltimasAnalisesSection
        analises={ultimasAnalises}
        viewerCanViewPremium={viewerPodeVerPremium(access)}
      />

      <PremiumPicksSection
        analises={premiumAnalises}
        picks={premiumPicks}
        access={access}
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-yellow-400">
          Tips do Dia
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TIPS_MOCK.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      </section>
    </main>
  );
}
