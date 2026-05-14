import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { listarQuickPicks } from "@/lib/picks/queries";
import { calcularEstatisticasQuickPicksEncerradas } from "@/lib/picks/stats";
import { PickCard } from "@/components/picks/PickCard";
import { PicksStatsBar } from "@/components/picks/PicksStatsBar";

const base = siteConfig.url.replace(/\/$/, "");

export const revalidate = siteConfig.revalidate.picks;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Picks rápidas | ${siteConfig.shortTitle}`;
  const description =
    "Mercado, odd e confiança em segundos — picks rápidas BarbosaTips sem análise longa.";
  return {
    title,
    description,
    alternates: { canonical: `${base}/picks` },
    openGraph: {
      title,
      description,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: `${base}/picks`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PicksPage() {
  const picks = await listarQuickPicks();
  const stats = calcularEstatisticasQuickPicksEncerradas(picks);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-pitch-950 pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(34,197,94,.08),transparent_55%)]" />

      <div className="container-site">
        <header className="mb-10 max-w-3xl border-b border-pitch-800 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
            Flash · Valor
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Picks <span className="text-gold">rápidas</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Linhas rápidas com odd e confiança —{" "}
            <span className="text-amber-300">ao vivo</span>,{" "}
            <span className="text-amber-200/90">pendente</span>,{" "}
            <span className="text-emerald-400">green</span>,{" "}
            <span className="text-red-400">red</span> ou{" "}
            <span className="text-zinc-400">void</span>.
          </p>
        </header>

        {picks.length > 0 ? <PicksStatsBar stats={stats} /> : null}

        {picks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-pitch-900/40 px-6 py-16 text-center">
            <p className="font-display text-lg text-zinc-400">
              Ainda não há picks publicadas.
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Volte em breve ou acompanhe as análises completas em /analises.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {picks.map((p) => (
              <li key={p.id}>
                <PickCard pick={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
