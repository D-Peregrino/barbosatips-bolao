import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { AnaliseCardGrid } from "@/components/analises/portal/AnaliseCardGrid";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { PickCard } from "@/components/picks/PickCard";
import { SportHero, SportStatsStrip } from "@/components/sport/SportHubBlocks";
import { siteConfig } from "@/config/site";
import {
  listarAnalisesPublicadasPorEsporteELiga,
} from "@/lib/analises/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { filtroListagemSoGratis, viewerPodeVerPremium } from "@/lib/premium/types";
import { listarQuickPicksPorEsporteELiga } from "@/lib/picks/queries";
import { buildSportHubStats } from "@/lib/sport-hub-stats";
import {
  getLeagueBySlug,
  getLeaguesForSport,
  isSportSlug,
} from "@/lib/sport-routes";

const base = siteConfig.url.replace(/\/$/, "");

export const revalidate = siteConfig.revalidate.analises;

type Props = { params: { esporte: string; campeonato: string } };

export async function generateStaticParams(): Promise<{ esporte: string; campeonato: string }[]> {
  const out: { esporte: string; campeonato: string }[] = [];
  for (const s of siteConfig.sports) {
    for (const l of getLeaguesForSport(s.slug)) {
      out.push({ esporte: s.slug, campeonato: l.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const esporte = params.esporte?.toLowerCase() ?? "";
  const campeonato = params.campeonato?.toLowerCase() ?? "";
  if (!isSportSlug(esporte)) return {};
  const league = getLeagueBySlug(esporte, campeonato);
  if (!league) return { title: "Competição | BarbosaTips" };

  const sport = siteConfig.sports.find((s) => s.slug === esporte)!;
  const title = `${league.label} · ${sport.label} | ${siteConfig.shortTitle}`;
  const description = `Análises e picks rápidas ${sport.label} — ${league.label}. ${siteConfig.description}`;
  const path = `/${esporte}/${league.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `${base}${path}` },
    openGraph: {
      title,
      description,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: `${base}${path}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CampeonatoPage({ params }: Props) {
  const esporte = params.esporte?.toLowerCase() ?? "";
  const campeonatoParam = params.campeonato ?? "";
  if (!isSportSlug(esporte)) notFound();

  const league = getLeagueBySlug(esporte, campeonatoParam);
  if (!league) notFound();

  if (campeonatoParam.toLowerCase() !== league.slug) {
    redirect(`/${esporte}/${league.slug}`);
  }

  const access = await getPremiumAccess();
  const soGratis = filtroListagemSoGratis(access);
  const viewerPremium = viewerPodeVerPremium(access);

  const [analises, picks] = await Promise.all([
    listarAnalisesPublicadasPorEsporteELiga(
      esporte,
      league.slug,
      league.label,
      soGratis,
    ),
    listarQuickPicksPorEsporteELiga(
      esporte,
      league.slug,
      league.label,
      soGratis,
    ),
  ]);

  const stats = buildSportHubStats(picks, analises.length);
  const sport = siteConfig.sports.find((s) => s.slug === esporte)!;

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
            title={league.label}
            subtitle={`Análises e picks filtrados para ${league.label} em ${sport.label}.`}
            leagues={getLeaguesForSport(esporte)}
          />

          <section className="commercial-card-elevated border border-amber-500/12 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">Estatísticas (picks)</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Amostra das picks rápidas desta competição no quick_picks.
            </p>
            <div className="mt-5">
              <SportStatsStrip stats={stats} />
            </div>
          </section>

          <section aria-labelledby="analises-liga">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <h2
                id="analises-liga"
                className="font-display text-xl font-bold text-white sm:text-2xl"
              >
                Análises
              </h2>
              <Link
                href={`/${esporte}`}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                ← Ver todo o {sport.label}
              </Link>
            </div>
            {analises.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-sm text-zinc-500">
                Ainda não há análises publicadas com este campeonato. Ajusta o texto do campo
                <strong className="text-zinc-400"> Campeonato </strong>
                no admin para coincidir com &quot;{league.label}&quot; ou o slug da competição.
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

          <section aria-labelledby="picks-liga">
            <h2
              id="picks-liga"
              className="mb-5 font-display text-xl font-bold text-white sm:text-2xl"
            >
              Picks rápidas
            </h2>
            {picks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-sm text-zinc-500">
                Sem picks nesta competição.
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
