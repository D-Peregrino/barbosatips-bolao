import type { Metadata } from "next";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { AnalisesPortal } from "@/components/analises/portal/AnalisesPortal";
import { PortalSocialCtaBand } from "@/components/portal/PortalSocialCtaBand";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { mapAnaliseRow } from "@/lib/analises/map-analise-row";
import type { AnaliseRow } from "@/lib/analises/types";
import { buildAutoMetaDescription } from "@/lib/seo/auto-meta-description";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnalisesDiretasResult = {
  rows: AnaliseRow[];
  error: string | null;
};

async function carregarAnalisesDireto(): Promise<AnalisesDiretasResult> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("analises")
      .select("*")
      .in("status", ["publicado", "published", "ativo"])
      .order("created_at", { ascending: false });

    console.warn("[ANALISES PAGE DIRETO]", { count: data?.length, error });

    if (error) {
      return { rows: [], error: error.message || "Erro ao carregar análises." };
    }

    const rows = ((data ?? []) as Record<string, unknown>[]).map((row) => mapAnaliseRow(row));

    return { rows, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[ANALISES PAGE DIRETO]", { count: 0, error: message });
    return { rows: [], error: message };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { rows: lista } = await carregarAnalisesDireto();
  const n = lista.length;
  const primary = lista[0];

  const baseTitle = `Prognósticos e análises esportivas | ${siteConfig.shortTitle}`;
  const title = primary
    ? `${primary.titulo.length > 58 ? `${primary.titulo.slice(0, 58)}…` : primary.titulo} | ${siteConfig.shortTitle}`
    : baseTitle;

  const description = buildAutoMetaDescription([
    n > 0 ? `${n} ${n === 1 ? "análise" : "análises"} com odds e contexto` : "prognósticos editoriais",
    primary?.titulo,
    primary?.campeonato,
    "confiança, mercados e leitura BarbosaTips",
  ]);

  const capa = primary?.imagem_capa?.trim();
  const ogImageUrl = capa
    ? capa.startsWith("http://") || capa.startsWith("https://")
      ? capa
      : `${siteConfig.url.replace(/\/$/, "")}${capa.startsWith("/") ? capa : `/${capa}`}`
    : null;
  const ogImages = ogImageUrl
    ? [{ url: ogImageUrl, width: 1200, height: 630, alt: primary?.titulo ?? siteConfig.shortTitle }]
    : undefined;

  const keywords = buildKeywordsFromParts([
    "análises",
    "prognósticos",
    primary?.campeonato,
    primary?.categoria,
    primary?.titulo,
  ]);

  return {
    title,
    description,
    keywords,
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
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function AnalisesPage() {
  const { rows: data, error } = await carregarAnalisesDireto();
  const shouldShowError = Boolean(error) && process.env.NODE_ENV !== "production";

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,.14),transparent_50%)]" />

      <CommercialPageShell>
        <div className="w-full min-w-0">
          <div className="mb-8 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <header className="commercial-card-elevated mb-6 max-w-3xl border-b border-amber-500/15 px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Editorial · Prognósticos
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Portal de <span className="text-gold">análises</span>
            </h1>
          </header>

          <SponsorSlot slot="feedBetween" className="mb-10" />

          {shouldShowError ? (
            <pre className="mb-6 overflow-x-auto rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-xs leading-relaxed text-red-200">
              {error}
            </pre>
          ) : null}

          <AnalisesPortal
            analises={data}
            viewerCanViewPremium
          />

          <div className="mt-12">
            <PortalSocialCtaBand />
          </div>

          <div className="mt-10 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
