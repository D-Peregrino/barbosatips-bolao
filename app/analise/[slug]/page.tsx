import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { obterAnalisePorSlug } from "@/lib/analises/queries";
import { oddParaNumero } from "@/lib/analises/types";
import { conteudoAnaliseParaHtmlPublico } from "@/lib/analises/render-conteudo-analise";
import {
  descricaoSeoAnalise,
  keywordsSeoAnalise,
  tituloSeoAnalise,
  urlAbsolutaImagemCapa,
  urlCanonicaAnalise,
  urlOgPadrao,
} from "@/lib/analises/seo-analise";
import { jsonLdAnaliseDetailGraph } from "@/lib/analises/json-ld-analise-page";
import { breadcrumbTrailForAnalise } from "@/lib/seo/breadcrumbs-model";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { viewerPodeVerPremium } from "@/lib/premium/types";
import { analiseContentTier } from "@/lib/premium/content-tier";
import { PremiumAnaliseBody } from "@/components/premium/PremiumAnaliseBody";
import { StatBlocksSection } from "@/components/analises/stat-blocks/StatBlocksSection";
import { AnaliseTierBadges } from "@/components/premium/AnaliseTierBadges";
import { FavoriteHeartButton } from "@/components/engagement/FavoriteHeartButton";

type Props = { params: { slug: string } };

function slugFromParams(paramsSlug: string): string {
  return decodeURIComponent(String(paramsSlug ?? "")).trim();
}

/** Uma leitura por pedido, partilhada entre `generateMetadata` e a página. */
const buscarAnaliseNaTabela = cache(async (paramsSlug: string) => {
  const slug = slugFromParams(paramsSlug);
  if (!slug) return null;
  return obterAnalisePorSlug(slug);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await buscarAnaliseNaTabela(params.slug);

  if (!data) {
    return {
      title: `Análise não encontrada | ${siteConfig.shortTitle}`,
      description: siteConfig.description,
      robots: { index: false, follow: false },
    };
  }

  const canonical = urlCanonicaAnalise(data.slug);
  const title = tituloSeoAnalise(data);
  const description = descricaoSeoAnalise(data);
  const keywords = keywordsSeoAnalise(data);
  const capa = urlAbsolutaImagemCapa(data);
  const ogImage = capa ?? urlOgPadrao();
  const isDraft = data.status === "rascunho";

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: isDraft
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: data.titulo,
      description,
      images: [
        {
          url: ogImage,
          alt: data.titulo || tituloSeoAnalise(data),
        },
      ],
      publishedTime: data.created_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: data.titulo,
      description,
      images: [ogImage],
    },
  };
}

export const revalidate = siteConfig.revalidate.analises;

export default async function AnaliseSlugPage({ params }: Props) {
  const data = await buscarAnaliseNaTabela(params.slug);
  const access = await getPremiumAccess();

  if (!data) {
    notFound();
  }

  const a = data;
  const podeVerPremium = viewerPodeVerPremium(access);
  const contentTier = analiseContentTier(a);
  const desbloqueado =
    a.status === "rascunho" || !a.is_premium || podeVerPremium;
  const oddFmt = oddParaNumero(a.odd).toFixed(2);
  const tg = siteConfig.social.telegram;
  const corpoHtml = conteudoAnaliseParaHtmlPublico(a.conteudo);
  const crumbs = breadcrumbTrailForAnalise(a);
  const graphLd = jsonLdAnaliseDetailGraph(a, crumbs);

  return (
    <article className="min-h-[calc(100vh-64px)] bg-black pb-20 pt-6 text-zinc-100">
      <JsonLdScript id="analise-jsonld" data={graphLd} />

      <div className="container-site max-w-3xl">
        <div className="mb-6">
          <Breadcrumbs items={crumbs} className="text-zinc-500" />
        </div>

        {a.status === "rascunho" ? (
          <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
            Rascunho — visível apenas em modo de teste (slug sem filtro de
            publicação).
          </p>
        ) : null}

        <header className="mb-8">
          <div
            className="mb-8 overflow-hidden rounded-2xl border border-[#3d3420]/80 bg-[#080706] shadow-[0_24px_60px_-32px_rgba(0,0,0,.85)]"
            aria-label="Capa da análise"
          >
            <AnaliseCapaMedia
              analise={a}
              aspectClass="aspect-[2/1] min-h-[160px] sm:aspect-[21/9] sm:min-h-[200px]"
            />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            {a.campeonato || "Campeonato"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {a.titulo}
            </h1>
            {a.is_premium ? <AnaliseTierBadges analise={a} className="shrink-0" /> : null}
            <FavoriteHeartButton kind="analise" refId={a.slug} className="shrink-0" />
          </div>
          <p className="mt-3 text-lg font-semibold text-zinc-200">
            {a.time_casa}{" "}
            <span className="text-zinc-600" aria-hidden>
              ×
            </span>{" "}
            {a.time_fora}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-300">
              Odd {oddFmt}
            </span>
            <span className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-200">
              Confiança {a.confianca}%
            </span>
          </div>
        </header>

        <StatBlocksSection blocks={a.stat_blocks} timeCasa={a.time_casa} timeFora={a.time_fora} />

        <div className="prose prose-invert prose-headings:font-display max-w-none rounded-2xl border border-[#2a2418] bg-[#0c0b09]/90 p-6 text-base leading-relaxed text-zinc-200 sm:p-8 prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-h1:text-2xl prose-h2:text-xl prose-a:text-[#C9A227] prose-blockquote:border-[#C9A227]/50 prose-blockquote:text-zinc-400 prose-hr:border-zinc-600">
          <PremiumAnaliseBody
            corpoHtml={corpoHtml}
            resumo={a.resumo}
            unlocked={desbloqueado}
            contentTier={contentTier}
          />
        </div>

        <aside className="mt-12 rounded-2xl border border-[#C9A227]/35 bg-gradient-to-br from-[#1a1610] to-[#0c0b09] p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-gold">
            Receba mais análises
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Entre no Telegram oficial da BarbosaTips para tips, análises e avisos
            em tempo real.
          </p>
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#229ED9] py-3 text-sm font-bold text-white transition hover:brightness-110 sm:w-auto sm:px-8"
          >
            CTA Telegram
          </a>
        </aside>
      </div>
    </article>
  );
}
