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
  {
    id: "2",
    esporte: "futebol",
    campeonato: "Premier League",
    jogo: "Arsenal x Chelsea",
    mercado: "Over 2.5 gols",
    selecao: "Mais de 2.5 gols",
    odd: 1.85,
    confianca: 4,
    horario: "16:00",
    status: "win",
  },
];

export default function TipsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-3 text-4xl font-bold text-yellow-400">
          Tips do Dia
        </h1>

        <p className="mb-8 text-zinc-400">
          Análises esportivas com odds, confiança e status.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TIPS_MOCK.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      </section>
    </main>
  );
}