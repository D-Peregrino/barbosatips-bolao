import { HeroSection } from "@/components/layout/HeroSection";
import { TipCard } from "@/components/tips/TipCard";
import type { TipCardData } from "@/components/tips/TipCard";

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

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HeroSection tipsHoje={4} />

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