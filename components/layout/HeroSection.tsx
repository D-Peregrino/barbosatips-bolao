"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, Zap, ChevronRight } from "lucide-react";
import { BrandShield } from "@/components/brand/BrandShield";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1459865264687-595fad653ce4?auto=format&fit=crop&w=1920&q=82";

const STATS = [
  { value: "1.200+", label: "Tips publicadas", detail: "desde 2022" },
  { value: "68%", label: "Taxa de acerto", detail: "últimos 90 dias" },
  { value: "340+", label: "Análises grátis", detail: "sem paywall" },
] as const;

export type HeroSectionProps = {
  tipsHoje?: number;
};

export function HeroSection({ tipsHoje = 0 }: HeroSectionProps) {
  const temTips = tipsHoje > 0;

  return (
    <section
      className="relative isolate min-h-[min(90vh,860px)] overflow-hidden border-b border-gold-400/15 bg-[var(--color-void)]"
      aria-labelledby="hero-titulo"
    >
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-[0.28] saturate-[0.85] contrast-[1.05]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-black/88 to-black/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25 sm:via-black/65"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_78%_18%,rgba(201,162,39,0.14),transparent_58%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_12%_88%,rgba(201,162,39,0.06),transparent_52%)]"
          aria-hidden
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 texture-club opacity-[0.65]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.22]"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/45 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(90vh,860px)] max-w-[1280px] flex-col gap-12 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pb-24 lg:pt-24">
        <div className="max-w-xl lg:max-w-[32rem] lg:flex-1">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-black/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-200 shadow-[0_0_28px_-8px_rgba(201,162,39,0.35)] backdrop-blur-sm transition hover:border-gold-300/45">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-35" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-300" />
              </span>
              {temTips
                ? `${tipsHoje} tip${tipsHoje > 1 ? "s" : ""} hoje`
                : "BarbosaTips · ao vivo"}
            </span>
            <span className="hidden rounded-full border border-gold-400/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cream-muted sm:inline-flex">
              Portal esportivo
            </span>
          </div>

          <h1
            id="hero-titulo"
            className="font-display text-[clamp(2.1rem,5.5vw,3.5rem)] font-bold leading-[1.06] tracking-tight text-cream drop-shadow-sm"
          >
            O jogo não espera.{" "}
            <span className="text-gold-gradient">A tua leitura</span> também não.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-cream-muted sm:text-lg">
            Prognósticos, picks rápidas e bolão com transparência — odd, confiança e contexto no
            padrão BarbosaTips: escudo preto e dourado, rigor editorial e zero estética de
            cassino.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:max-w-xl">
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <Link
                href="/picks"
                className="group relative inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-5 text-sm font-bold uppercase tracking-wide text-pitch-950 shadow-[0_18px_44px_-14px_rgba(201,162,39,0.45)] transition duration-300 hover:brightness-105 active:scale-[0.99]"
              >
                <Zap className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                Picks rápidas
                <ChevronRight className="h-4 w-4 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/bolao"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-gold-400/40 bg-black/45 px-5 text-sm font-bold uppercase tracking-wide text-gold-100 backdrop-blur-sm transition duration-300 hover:border-gold-300/60 hover:bg-gold-400/8 active:scale-[0.99]"
              >
                <Trophy className="h-4 w-4 shrink-0 text-gold-200" strokeWidth={2.2} />
                Bolão Copa 2026
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <Link
                href="/tips"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cream-muted transition hover:text-gold-200"
              >
                Tips do dia
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/analises"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cream-muted transition hover:text-gold-200"
              >
                Análises
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <ul className="mt-12 grid max-w-md grid-cols-3 gap-2 sm:mt-14 sm:gap-3">
            {STATS.map(({ value, label, detail }) => (
              <li key={label}>
                <div className="commercial-card-elevated flex flex-col rounded-2xl p-3 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/28 sm:p-4">
                  <span className="font-display text-[clamp(1.1rem,3.5vw,1.5rem)] font-bold tabular-nums leading-none text-gold-gradient">
                    {value}
                  </span>
                  <span className="mt-1.5 text-[10px] font-semibold uppercase leading-tight tracking-wide text-cream sm:text-[11px]">
                    {label}
                  </span>
                  <span className="mt-0.5 text-[9px] text-stone-500 sm:text-[10px]">{detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-1 justify-center lg:justify-end lg:pr-4">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(201,162,39,0.2),transparent_62%)] blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col items-center">
            <BrandShield size="hero" glow="medium" priority decorative />
            <p className="mt-5 max-w-[14rem] text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-gold-400/90">
              Desde a primeira odd
            </p>
            <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-stone-500">
              Identidade de clube europeu — precisão, contexto e respeito pelo jogo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
