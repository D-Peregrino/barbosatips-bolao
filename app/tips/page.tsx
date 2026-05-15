import { TipCard } from "@/components/tips/TipCard";
import type { TipCardData } from "@/components/tips/TipCard";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { PortalSocialCtaBand } from "@/components/portal/PortalSocialCtaBand";

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
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_75%_50%_at_50%_-18%,rgba(201,162,39,.12),transparent_52%)]"
        aria-hidden
      />

      <CommercialPageShell>
        <div className="w-full min-w-0 space-y-8">
          <div className="lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <header className="commercial-card-elevated max-w-3xl border-b border-gold-400/12 p-6 pb-8 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400/95">
              Stake · Confiança · Status
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tips do <span className="text-gold-gradient">dia</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
              Cartões com odd sugerida, nível de confiança e resultado — mesmo visual premium do portal
              BarbosaTips (dados de demonstração até ligação total ao feed editorial).
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {TIPS_MOCK.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>

          <PortalSocialCtaBand kicker="Quando o feed editorial sincronizar, avisamos primeiro no Telegram." />

          <div className="hidden sm:block">
            <SponsorSlot slot="homeHorizontal" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
