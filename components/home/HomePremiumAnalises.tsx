import Link from "next/link";
import { Lock } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { rotuloEsporte, iconeEsporte } from "@/lib/picks/rotulo-esporte";
import { PremiumSpotlightPlaceholders } from "@/components/portal/PremiumSpotlightPlaceholders";
import { cn } from "@/lib/utils";

type Props = {
  analises: AnaliseRow[];
  viewerCanViewPremium: boolean;
};

function labelCategoria(a: AnaliseRow): string {
  const c = a.categoria?.trim();
  return c || "Editorial";
}

function CardPremium({
  a,
  viewerCanViewPremium,
}: {
  a: AnaliseRow;
  viewerCanViewPremium: boolean;
}) {
  const oddFmt = oddParaNumero(a.odd).toFixed(2).replace(".", ",");
  const sport = rotuloEsporte(a.esporte);
  const icon = iconeEsporte(a.esporte);
  const lockedPreview = a.is_premium && !viewerCanViewPremium;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold-400/18 bg-gradient-to-b from-pitch-900/95 to-black shadow-[0_28px_70px_-34px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-1 hover:border-gold-400/35">
      <div className="relative">
        <AnaliseCapaMedia analise={a} aspectClass="aspect-[16/11]" />
        {a.is_premium ? (
          <div className="absolute left-3 top-3 z-10">
            <PremiumLockBadge />
          </div>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream backdrop-blur-sm">
            {labelCategoria(a)}
          </span>
          <span className="rounded-full border border-gold-400/25 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-gold-100 backdrop-blur-sm">
            {icon} {sport}
          </span>
          {a.campeonato?.trim() ? (
            <span className="rounded-full border border-emerald-500/20 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-emerald-100/95 backdrop-blur-sm">
              {a.campeonato.trim()}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-cream">
          {a.titulo}
        </h3>
        <p className="text-xs font-medium text-stone-500">
          {a.time_casa} <span className="text-stone-600">×</span> {a.time_fora}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-sm font-bold text-emerald-200">
            @{oddFmt}
          </span>
          <span className="rounded-lg border border-gold-400/25 bg-gold-400/8 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gold-100">
            Conf. {a.confianca}%
          </span>
        </div>
        <p
          className={cn(
            "line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500",
            lockedPreview && "blur-[4px] select-none",
          )}
        >
          {a.resumo?.trim() || "Análise premium com leitura de mercado."}
        </p>
        <Link
          href={`/analise/${encodeURIComponent(a.slug)}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gold-400/35 bg-gold-400/[0.07] py-3 text-sm font-bold text-gold-100 transition hover:bg-gold-400/12"
        >
          {lockedPreview ? (
            <>
              <Lock className="h-4 w-4" aria-hidden />
              Desbloquear
            </>
          ) : (
            "Ler análise"
          )}
        </Link>
      </div>
    </article>
  );
}

export function HomePremiumAnalises({ analises, viewerCanViewPremium }: Props) {
  if (analises.length === 0) {
    return <PremiumSpotlightPlaceholders />;
  }

  return (
    <section
      className="relative rounded-2xl border border-gold-400/12 bg-gradient-to-b from-black/40 via-pitch-950/80 to-[#030201] px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="home-premium-analises"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(201,162,39,0.1),transparent_55%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400/95">
              BarbosaTips Premium
            </p>
            <h2
              id="home-premium-analises"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl"
            >
              Análises <span className="text-gold-gradient">premium</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-stone-500">
              Thumbnails grandes, contexto completo e filtros por esporte — arquivo editorial de elite.
            </p>
          </div>
          <Link
            href="/premium"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-300 px-6 py-3 text-sm font-bold text-pitch-950 shadow-gold-sm transition hover:brightness-105"
          >
            Ver Premium
          </Link>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {analises.map((a) => (
            <li key={a.id}>
              <CardPremium a={a} viewerCanViewPremium={viewerCanViewPremium} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
