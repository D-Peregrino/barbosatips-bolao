import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { AnaliseCardGrid } from "@/components/analises/portal/AnaliseCardGrid";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { PickCard } from "@/components/picks/PickCard";
import { SportHero, SportStatsStrip } from "@/components/sport/SportHubBlocks";
import { siteConfig } from "@/config/site";
import { listarAnalisesPublicadasPorEsporte } from "@/lib/analises/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { filtroListagemSoGratis, viewerPodeVerPremium } from "@/lib/premium/types";
import { listarQuickPicksPorEsporte } from "@/lib/picks/queries";
import { buildSportHubStats } from "@/lib/sport-hub-stats";
import { getLeaguesForSport, isSportSlug } from "@/lib/sport-routes";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { FollowToggleButton } from "@/components/engagement/FollowToggleButton";

export const revalidate = siteConfig.revalidate.analises;

type Props = { params: { esporte: string } };

export async function generateStaticParams(): Promise<{ esporte: string }[]> {
  return siteConfig.sports.map((s) => ({ esporte: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const esporte = params.esporte?.toLowerCase() ?? "";
  if (!isSportSlug(esporte)) return {};
  const sport = siteConfig.sports.find((s) => s.slug === esporte)!;
  const title = `${sport.label} | Análises e picks | ${siteConfig.shortTitle}`;
  const description = `Portal ${sport.label}: análises publicadas, picks rápidas e estatísticas agregadas. ${siteConfig.description}`;
  const path = `/${esporte}`;
  return buildPageMetadata({
    title,
    description,
    path,
    keywords: buildKeywordsFromParts([sport.label, sport.slug, "análises", "picks"]),
  });
}

export default async function EsportePage({ params }: Props) {
  const esporte = params.esporte?.toLowerCase() ?? "";
  if (!isSportSlug(esporte)) notFound();

  const access = await getPremiumAccess();
  const soGratis = filtroListagemSoGratis(access);
  const viewerPremium = viewerPodeVerPremium(access);

  const [analises, picks] = await Promise.all([
    listarAnalisesPublicadasPorEsporte(esporte, soGratis),
    listarQuickPicksPorEsporte(esporte, soGratis),
  ]);

  const stats = buildSportHubStats(picks, analises.length);
  const sport = siteConfig.sports.find((s) => s.slug === esporte)!;
  const leagues = getLeaguesForSport(esporte);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -15%, ${sport.color}22, transparent 50%)`,
        }}
        aria-hidden
      />

      <CommercialPageShell>
        <div className="w-full min-w-0 space-y-8">
          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>

          <SportHero
            esporteSlug={esporte}
            title={sport.label}
            subtitle={`Análises e picks rápidas BarbosaTips em ${sport.label}. Escolhe uma competição ou navega pelos cards.`}
            leagues={leagues}
            actionsSlot={
              <FollowToggleButton kind="esporte" refKey={esporte} showLabel label={`Seguir ${sport.label}`} />
            }
          />

          <section className="commercial-card-elevated border border-amber-500/12 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">Estatísticas do esporte</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Resumo das quick_picks com <code className="text-amber-200/90">esporte = {esporte}</code>.
            </p>
            <div className="mt-5">
              <SportStatsStrip stats={stats} />
            </div>
          </section>

          <section aria-labelledby="analises-esporte">
            <h2
              id="analises-esporte"
              className="mb-5 font-display text-xl font-bold text-white sm:text-2xl"
            >
              Análises
            </h2>
            {analises.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-sm text-zinc-500">
                Ainda não há análises com esporte &quot;{sport.label}&quot; no editorial. Define o
                campo <strong className="text-zinc-400">Esporte</strong> no admin ao publicar.
              </p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {analises.map((a) => (
                  <li key={a.id}>
                    <AnaliseCardGrid analise={a} viewerCanViewPremium={viewerPremium} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="picks-esporte">
            <h2
              id="picks-esporte"
              className="mb-5 font-display text-xl font-bold text-white sm:text-2xl"
            >
              Picks rápidas
            </h2>
            {picks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-sm text-zinc-500">
                Sem picks neste esporte.
              </p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {picks.map((p) => (
                  <li key={p.id}>
                    <PickCard pick={p} viewerCanViewPremium={viewerPremium} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="lg:hidden">
            <AdSlot variant="mobile-inline" intent="sponsor" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
