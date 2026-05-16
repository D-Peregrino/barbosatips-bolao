import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { AnaliseFeaturedHero } from "@/components/analises/portal/AnaliseFeaturedHero";
import { AnaliseCardGrid } from "@/components/analises/portal/AnaliseCardGrid";
import { AnalisesSidebar } from "@/components/analises/portal/AnalisesSidebar";
import { AnalisesCommunityDeck } from "@/components/community/AnalisesCommunityDeck";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { siteConfig } from "@/config/site";
import { betaPremiumHref } from "@/lib/beta/cta-hrefs";

type Props = {
  analises: AnaliseRow[];
  viewerCanViewPremium?: boolean;
};

export function AnalisesPortal({
  analises,
  viewerCanViewPremium = true,
}: Props) {
  if (analises.length === 0) {
    return (
      <PortalEmptyState
        icon={Newspaper}
        title="Análises em breve"
        description="Ainda não há prognósticos publicados nesta secção. Explora as picks rápidas, segue a comunidade no Telegram ou assiste às leituras em vídeo no YouTube."
        primaryHref="/picks"
        primaryLabel="Ver picks"
        secondaryHref="/comunidade"
        secondaryLabel="Entrar na comunidade"
        tertiaryHref={siteConfig.hub.youtubeCanalUrl}
        tertiaryLabel="Assistir no YouTube"
        quaternaryHref="/bolao"
        quaternaryLabel="Participar do bolão"
      />
    );
  }

  const [destaque, ...restantes] = analises;
  const gridItems = restantes;
  const sidebarItens = restantes.slice(0, 7);

  return (
    <div className="lg:grid lg:grid-cols-1 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-12">
      <div className="min-w-0 space-y-12">
        <section aria-labelledby="analises-destaque-heading">
          <h2 id="analises-destaque-heading" className="sr-only">
            Última análise em destaque
          </h2>
          <AnaliseFeaturedHero analise={destaque} viewerCanViewPremium={viewerCanViewPremium} />
        </section>

        <AnalisesCommunityDeck />

        {gridItems.length > 0 ? (
          <section aria-labelledby="analises-grid-heading">
            <div className="mb-6 flex flex-col gap-2 border-b border-[#2a2418]/90 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="analises-grid-heading"
                  className="font-display text-xl font-bold text-white sm:text-2xl"
                >
                  Mais prognósticos
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Odds, confiança e contexto para cada confronto.
                </p>
              </div>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {gridItems.map((a) => (
                <li key={a.id}>
                  <AnaliseCardGrid
                    analise={a}
                    viewerCanViewPremium={viewerCanViewPremium}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className="mt-12 min-w-0 space-y-8 xl:mt-0">
        <AnalisesSidebar itens={sidebarItens} viewerCanViewPremium={viewerCanViewPremium} />
        <div className="hidden xl:block">
          <Link
            href={betaPremiumHref()}
            className="block rounded-xl border border-gold-400/20 bg-black/30 px-4 py-4 text-center text-sm font-semibold text-gold-100 transition hover:border-gold-400/35"
          >
            {siteConfig.betaLaunch.enabled && siteConfig.betaLaunch.lockedContentUpsellToLogin
              ? "Entrar para desbloquear →"
              : "Programa Premium →"}
          </Link>
        </div>
      </aside>
    </div>
  );
}
