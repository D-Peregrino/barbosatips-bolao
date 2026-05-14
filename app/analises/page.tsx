import { cache } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { listarAnalisesPublicadas } from "@/lib/analises/queries";
import { AnalisesPortal } from "@/components/analises/portal/AnalisesPortal";

const listarAnalisesCached = cache(async () => listarAnalisesPublicadas());

export const revalidate = siteConfig.revalidate.analises;

export async function generateMetadata(): Promise<Metadata> {
  const lista = await listarAnalisesCached();
  const n = lista.length;
  const primary = lista[0];

  const baseTitle = `Prognósticos e análises esportivas | ${siteConfig.shortTitle}`;
  const title = primary
    ? `${primary.titulo.length > 58 ? `${primary.titulo.slice(0, 58)}…` : primary.titulo} | ${siteConfig.shortTitle}`
    : baseTitle;

  const description =
    n > 0
      ? `${n} ${n === 1 ? "análise publicada" : "análises publicadas"} com odds, confiança e leitura de mercado. ${siteConfig.description}`
      : `Portal editorial de prognósticos: odds, confiança e contexto por confronto. ${siteConfig.description}`;

  const capa = primary?.imagem_capa?.trim();
  const ogImageUrl = capa
    ? capa.startsWith("http://") || capa.startsWith("https://")
      ? capa
      : `${siteConfig.url.replace(/\/$/, "")}${capa.startsWith("/") ? capa : `/${capa}`}`
    : null;
  const ogImages = ogImageUrl ? [{ url: ogImageUrl }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/analises` },
    openGraph: {
      title: primary ? `${primary.titulo} | ${siteConfig.name}` : baseTitle,
      description,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: `${siteConfig.url}/analises`,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: primary ? `${primary.titulo} | ${siteConfig.name}` : baseTitle,
      description,
    },
  };
}

export default async function AnalisesPage() {
  const data = await listarAnalisesCached();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030201] pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,.12),transparent_50%)]" />

      <div className="container-site">
        <header className="mb-12 max-w-3xl border-b border-[#3d3420]/70 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
            Editorial · Prognósticos
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Portal de <span className="text-gold">análises</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Prognósticos com odd sugerida, nível de confiança e resumo editorial — o
            mesmo padrão visual premium BarbosaTips em cada confronto.
          </p>
        </header>

        <AnalisesPortal analises={data} />
      </div>
    </div>
  );
}
