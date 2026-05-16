import Link from "next/link";
import { ChevronRight, Send, Youtube } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { BrandShield } from "@/components/brand/BrandShield";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { rotuloEsporte, iconeEsporte } from "@/lib/picks/rotulo-esporte";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type Props = {
  analise: AnaliseRow | null;
  viewerCanViewPremium: boolean;
};

function HeroCtas({ hub, compact }: { hub: typeof siteConfig.hub; compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
      <a
        href={hub.telegramCanal}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-[#229ED9]/45 bg-[#229ED9]/15 text-white backdrop-blur-sm transition hover:bg-[#229ED9]/28",
          compact
            ? "min-h-[36px] px-3 text-[10px] font-bold uppercase tracking-wide"
            : "min-h-[40px] px-4 text-xs font-bold uppercase tracking-wide",
        )}
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        Telegram
      </a>
      <a
        href={hub.youtubeCanalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/35 text-red-50 backdrop-blur-sm transition hover:bg-red-950/50",
          compact
            ? "min-h-[36px] px-3 text-[10px] font-bold uppercase tracking-wide"
            : "min-h-[40px] px-4 text-xs font-bold uppercase tracking-wide",
        )}
      >
        <Youtube className="h-3.5 w-3.5" aria-hidden />
        YouTube
      </a>
    </div>
  );
}

export function HomePortalHero({ analise, viewerCanViewPremium }: Props) {
  const { hub } = siteConfig;

  if (!analise) {
    return (
      <section
        className="home-hero-cinematic relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#141824] via-[#0a0b12] to-[#06070b] px-4 py-12 sm:py-14"
        aria-labelledby="home-hero-fallback"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,162,39,0.12),transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <BrandShield size="lg" glow="soft" priority decorative />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.35em] text-gold-400">
            BarbosaTips
          </p>
          <h1
            id="home-hero-fallback"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl"
          >
            O teu portal <span className="text-gold-gradient">esportivo</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
            Picks, análises e performance pública — tudo num só lugar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <Link
              href="/analises"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-6 text-xs font-bold uppercase tracking-wide text-pitch-950 shadow-gold-md"
            >
              Explorar portal
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/picks"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 text-xs font-bold uppercase tracking-wide text-cream backdrop-blur-md"
            >
              Ver picks
            </Link>
          </div>
          <div className="mt-6 flex justify-center">
            <HeroCtas hub={hub} compact />
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
    <article className="home-hero-editorial-card" aria-labelledby="home-hero-titulo">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
        {/* Conteúdo editorial */}
        <div className="flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="status-live text-[10px]">
              <span className="status-live-dot" aria-hidden />
              Destaque
            </span>
            {analise.is_premium ? <PremiumLockBadge /> : null}
            <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-300">
              {sportIcon} {sport}
            </span>
            {analise.campeonato?.trim() ? (
              <span className="hidden rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] font-medium text-stone-500 sm:inline">
                {analise.campeonato.trim()}
              </span>
            ) : null}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-400/90">
            Análise em destaque
          </p>

          <h1
            id="home-hero-titulo"
            className="mt-2 font-display text-2xl font-bold leading-[1.08] tracking-tight text-white sm:text-[1.65rem] lg:text-[1.85rem]"
          >
            {analise.titulo}
          </h1>

          <p className="mt-2 text-sm font-medium text-stone-400 sm:text-base">
            {analise.time_casa}{" "}
            <span className="text-stone-600">×</span> {analise.time_fora}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="odd-pill px-3 py-2 text-lg sm:text-xl">@{oddFmt}</span>
            <span className="rounded-xl border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gold-100">
              Confiança {analise.confianca}%
            </span>
          </div>

          <p
            className={cn(
              "mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-stone-500",
              locked && "select-none blur-[5px]",
            )}
          >
            {analise.resumo?.trim() ||
              "Leitura de confronto, contexto e odd sugerida no padrão BarbosaTips."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-white/[0.06] pt-5">
            <Link
              href={`/analise/${encodeURIComponent(analise.slug)}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-5 text-xs font-bold uppercase tracking-wide text-pitch-950 shadow-gold-md transition hover:brightness-110"
            >
              {locked ? "Pré-visualizar" : "Ler análise"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/picks"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-bold uppercase tracking-wide text-stone-200 transition hover:bg-white/[0.08]"
            >
              Picks
            </Link>
          </div>
          <div className="mt-3 hidden sm:block">
            <HeroCtas hub={hub} compact />
          </div>
        </div>

        {/* Capa — coluna direita no desktop */}
        <div className="home-hero-editorial-media relative min-h-[180px] lg:min-h-0">
          {capa ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capa}
              alt=""
              className="absolute inset-0 h-full w-full"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#1a2030] via-[#0d0f18] to-[#06070b]"
              aria-hidden
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06070b]/90 via-[#06070b]/25 to-transparent lg:bg-gradient-to-l lg:from-[#06070b] lg:via-[#06070b]/55 lg:to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_30%,rgba(201,162,39,0.1),transparent_55%)]" aria-hidden />
          <div className="absolute bottom-3 right-3 hidden opacity-80 lg:block">
            <BrandShield size="md" glow="soft" decorative />
          </div>
        </div>
      </div>
    </article>
  );
}
