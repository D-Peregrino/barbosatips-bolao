import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { BrandShield } from "@/components/brand/BrandShield";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { rotuloEsporte, iconeEsporte } from "@/lib/picks/rotulo-esporte";
import { cn } from "@/lib/utils";

type Props = {
  analise: AnaliseRow | null;
  viewerCanViewPremium: boolean;
};

export function HomePortalHero({ analise, viewerCanViewPremium }: Props) {
  if (!analise) {
    return (
      <section
        className="relative isolate overflow-hidden border-b border-gold-400/12 bg-gradient-to-br from-[#0a0906] via-[#050403] to-[#080706]"
        aria-labelledby="home-hero-fallback"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(201,162,39,0.12),transparent_55%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 texture-club opacity-40" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:py-24">
          <BrandShield size="hero" glow="medium" priority decorative />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-400/95">
              BarbosaTips
            </p>
            <h1
              id="home-hero-fallback"
              className="mt-3 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl"
            >
              Portal de análises <span className="text-gold-gradient">esportivas</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base">
              Prognósticos, picks rápidas e leitura de mercado — em breve o destaque principal aparece aqui.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/analises"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-6 py-3 text-sm font-bold uppercase tracking-wide text-pitch-950 shadow-gold-md transition hover:brightness-105"
            >
              Ver análises
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/picks"
              className="inline-flex items-center gap-2 rounded-xl border border-gold-400/35 bg-black/40 px-6 py-3 text-sm font-bold uppercase tracking-wide text-gold-100 backdrop-blur-sm transition hover:border-gold-300/55"
            >
              Picks rápidas
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const oddFmt = oddParaNumero(analise.odd).toFixed(2).replace(".", ",");
  const locked = analise.is_premium && !viewerCanViewPremium;
  const capa = analise.imagem_capa?.trim();
  const sport = rotuloEsporte(analise.esporte);
  const sportIcon = iconeEsporte(analise.esporte);

  return (
    <section
      className="relative isolate min-h-[min(78vh,720px)] overflow-hidden border-b border-gold-400/12"
      aria-labelledby="home-hero-titulo"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a07] via-[#050403] to-[#030201]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_100%_0%,rgba(201,162,39,0.14),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 texture-club opacity-50" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:min-h-[min(78vh,720px)] lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <BrandShield size="lg" glow="soft" decorative />
            {analise.is_premium ? <PremiumLockBadge /> : null}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/25 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-200/95">
              <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden />
              Destaque do dia
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400/95">
            <span aria-hidden>{sportIcon}</span>{" "}
            <span className="text-cream-muted/90">{sport}</span>
            {analise.campeonato?.trim() ? (
              <>
                {" "}
                <span className="text-stone-600">·</span>{" "}
                <span className="text-stone-400">{analise.campeonato.trim()}</span>
              </>
            ) : null}
          </p>

          <h1
            id="home-hero-titulo"
            className="mt-3 font-display text-[clamp(1.75rem,4.5vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-cream"
          >
            {analise.titulo}
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 font-mono text-lg font-extrabold tabular-nums text-emerald-200">
              @{oddFmt}
            </span>
            <span className="rounded-lg border border-gold-400/30 bg-gold-400/10 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-gold-100">
              Confiança {analise.confianca}%
            </span>
          </div>

          <p
            className={cn(
              "mt-5 max-w-xl text-sm leading-relaxed text-stone-500 sm:text-base",
              locked && "select-none blur-[5px]",
            )}
          >
            {analise.resumo?.trim() || "Leitura de confronto, contexto e odd sugerida no padrão BarbosaTips."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/analise/${encodeURIComponent(analise.slug)}`}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-6 text-sm font-bold uppercase tracking-wide text-pitch-950 shadow-gold-md transition hover:brightness-105"
            >
              {locked ? "Pré-visualizar" : "Ler análise completa"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/picks"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gold-400/35 bg-black/40 px-5 text-sm font-semibold text-gold-100 transition hover:border-gold-300/50"
            >
              Ver picks rápidas
            </Link>
          </div>
        </div>

        <div className="relative min-h-[240px] lg:min-h-[380px]">
          <div className="commercial-card-elevated relative h-full min-h-[240px] overflow-hidden rounded-2xl lg:min-h-[380px]">
            {capa ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL dinâmica (Storage / externo)
              <img
                src={capa}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pitch-900 to-black">
                <BrandShield size="xl" glow="medium" decorative />
              </div>
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-200/90">
                {analise.time_casa} <span className="text-stone-500">×</span> {analise.time_fora}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-cream/95">{analise.titulo}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
