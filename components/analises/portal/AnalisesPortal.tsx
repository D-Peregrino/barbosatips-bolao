import Link from "next/link";
import type { AnaliseRow } from "@/lib/analises/types";
import { AnaliseFeaturedHero } from "@/components/analises/portal/AnaliseFeaturedHero";
import { AnaliseCardGrid } from "@/components/analises/portal/AnaliseCardGrid";
import { AnalisesSidebar } from "@/components/analises/portal/AnalisesSidebar";
import { AnalisesCommunityDeck } from "@/components/community/AnalisesCommunityDeck";
import { LeadInlineCTA } from "@/components/leads/LeadInlineCTA";

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
      <div className="rounded-3xl border border-[#3d3420]/60 bg-[#0c0b09]/90 px-6 py-16 text-center shadow-[0_24px_60px_-32px_rgba(0,0,0,.85)]">
        <p className="text-lg font-display font-semibold text-zinc-300">
          Prognósticos em breve
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
          Ainda não há análises publicadas. Publique em{" "}
          <Link
            href="/admin-editorial/nova"
            className="font-semibold text-[#C9A227] underline-offset-2 hover:underline"
          >
            /admin-editorial/nova
          </Link>{" "}
          com estado &quot;Publicado&quot;.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-[#E8D48B] underline-offset-4 hover:underline"
        >
          Voltar ao início
        </Link>
      </div>
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

        <LeadInlineCTA context="analises" className="scroll-mt-28" />

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

      <div className="mt-12 min-w-0 xl:mt-0">
        <AnalisesSidebar
          itens={sidebarItens}
          viewerCanViewPremium={viewerCanViewPremium}
        />
      </div>
    </div>
  );
}
