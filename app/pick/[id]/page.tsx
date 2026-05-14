import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { VipBadge } from "@/components/premium/VipBadge";
import { pickContentTier } from "@/lib/premium/content-tier";
import { FavoriteHeartButton } from "@/components/engagement/FavoriteHeartButton";
import { siteConfig } from "@/config/site";
import { breadcrumbTrailForPick } from "@/lib/seo/breadcrumbs-model";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { jsonLdPickDetailGraph } from "@/lib/seo/json-ld-pick-page";
import { descricaoSeoPick, keywordsSeoPick, tituloSeoPick } from "@/lib/seo/pick-seo";
import { iconeEsporte, rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import { listarQuickPicksParaSitemap, obterQuickPickPorId } from "@/lib/picks/queries";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { viewerPodeVerPremium } from "@/lib/premium/types";
import { betaPremiumHref, betaVipHref } from "@/lib/beta/cta-hrefs";

type Props = { params: { id: string } };

const getPick = cache(async (raw: string) => obterQuickPickPorId(raw));

export const revalidate = siteConfig.revalidate.picks;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const rows = await listarQuickPicksParaSitemap(400);
  return rows.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pick = await getPick(params.id);
  if (!pick) {
    return {
      title: `Pick | ${siteConfig.shortTitle}`,
      description: siteConfig.description,
      robots: { index: false, follow: true },
    };
  }
  return buildPageMetadata({
    title: tituloSeoPick(pick),
    description: descricaoSeoPick(pick),
    path: `/pick/${pick.id}`,
    keywords: keywordsSeoPick(pick),
    ogType: "article",
    publishedTime: pick.created_at || undefined,
  });
}

function formatarHorario(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PickPublicPage({ params }: Props) {
  const pick = await getPick(params.id);
  if (!pick) notFound();

  const access = await getPremiumAccess();
  const podeVer = viewerPodeVerPremium(access);
  const locked = pick.is_premium && !podeVer;
  const tier = pickContentTier(pick);
  const crumbs = breadcrumbTrailForPick(pick);
  const graph = jsonLdPickDetailGraph(pick, crumbs);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <JsonLdScript id="pick-jsonld" data={graph} />
      <CommercialPageShell>
        <div className="w-full min-w-0 space-y-6">
          <Breadcrumbs items={crumbs} className="max-w-3xl" />

          <article className="commercial-card-elevated max-w-3xl border p-6 sm:p-8">
            <header className="border-b border-gold-400/10 pb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
                Pick rápida · {iconeEsporte(pick.esporte)} {rotuloEsporte(pick.esporte)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {pick.jogo}
                </h1>
                {pick.is_premium ? (
                  <span className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {tier === "exclusive" ? <VipBadge compact /> : null}
                    <PremiumLockBadge className="shrink-0" />
                  </span>
                ) : null}
                <FavoriteHeartButton kind="pick" refId={pick.id} className="shrink-0" />
              </div>
              {pick.campeonato?.trim() ? (
                <p className="mt-2 text-sm text-zinc-400">{pick.campeonato.trim()}</p>
              ) : null}
            </header>

            <div className="mt-6 space-y-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-zinc-500">Mercado</dt>
                  <dd className="mt-1 font-semibold text-cream">{pick.mercado}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Odd</dt>
                  <dd className="mt-1 font-mono text-xl font-bold text-gold-200">@{pick.odd.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Confiança</dt>
                  <dd className="mt-1 font-semibold text-amber-200">{pick.confianca}%</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Horário</dt>
                  <dd className="mt-1">
                    <time dateTime={pick.horario_jogo} className="font-medium text-cream-muted">
                      {formatarHorario(pick.horario_jogo)}
                    </time>
                  </dd>
                </div>
              </dl>

              <section aria-labelledby="pick-res">
                <h2 id="pick-res" className="sr-only">
                  Resultado
                </h2>
                <p className="text-sm text-zinc-400">
                  Estado: <span className="font-semibold text-zinc-200">{pick.status}</span> · Resultado:{" "}
                  <span className="font-semibold text-zinc-200">{pick.resultado}</span>
                </p>
              </section>

              <section aria-labelledby="pick-just">
                <h2 id="pick-just" className="font-display text-lg font-bold text-white">
                  Leitura rápida
                </h2>
                {locked ? (
                  <div className="relative mt-3 overflow-hidden rounded-xl border border-amber-500/25 bg-black/40 p-8 text-center">
                    {tier === "exclusive" ? (
                      <div className="flex justify-center">
                        <VipBadge />
                      </div>
                    ) : null}
                    <PremiumLockBadge className="mx-auto mt-2" />
                    <p className="mt-3 text-sm text-zinc-400">
                      Justificativa completa no Premium{tier === "exclusive" ? " / VIP" : ""}.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold">
                      <Link href={betaVipHref()} className="text-gold-300 underline-offset-2 hover:underline">
                        Programa VIP
                      </Link>
                      <Link href={betaPremiumHref()} className="text-amber-300 underline-offset-2 hover:underline">
                        Premium
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    {pick.justificativa?.trim() || "Sem justificativa longa — pick flash BarbosaTips."}
                  </p>
                )}
              </section>
            </div>

            <p className="mt-8 text-center">
              <Link href="/picks" className="text-sm font-semibold text-gold-300 hover:underline">
                ← Todas as picks
              </Link>
            </p>
          </article>
        </div>
      </CommercialPageShell>
    </div>
  );
}
