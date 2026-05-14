"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, Zap, ChevronRight } from "lucide-react";

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
      className="relative isolate min-h-[min(88vh,820px)] overflow-hidden border-b border-amber-500/20 bg-black"
      aria-labelledby="hero-titulo"
    >
      {/* Imagem esportiva + máscaras */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-[0.42] saturate-[1.05]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent sm:via-black/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_70%_20%,rgba(245,158,11,0.18),transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(59,130,246,0.08),transparent_50%)]"
          aria-hidden
        />
      </div>

      {/* Textura fina */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(88vh,820px)] max-w-[1240px] flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:justify-center lg:pb-24 lg:pt-20">
        <div className="max-w-2xl lg:max-w-[34rem]">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-black/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200 shadow-[0_0_24px_-6px_rgba(245,158,11,0.35)] backdrop-blur-sm transition hover:border-amber-400/50">
              <span
                className="relative flex h-2 w-2 shrink-0"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              {temTips
                ? `${tipsHoje} tip${tipsHoje > 1 ? "s" : ""} hoje`
                : "BarbosaTips ao vivo"}
            </span>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:inline-flex">
              Portal premium
            </span>
          </div>

          <h1
            id="hero-titulo"
            className="font-display text-[clamp(2rem,6vw,3.35rem)] font-bold leading-[1.05] tracking-tight text-white drop-shadow-md"
          >
            O jogo não espera.{" "}
            <span className="text-gold-gradient">A tua leitura</span>{" "}
            também não.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Prognósticos, picks rápidas e bolão com transparência — odd, confiança e contexto
            no padrão BarbosaTips: preto, dourado e sem ruído de cassino.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:max-w-xl">
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <Link
                href="/picks"
                className="group relative inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_16px_40px_-12px_rgba(245,158,11,0.55)] transition duration-300 hover:brightness-105 hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.45)] active:scale-[0.99]"
              >
                <Zap className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                Picks rápidas
                <ChevronRight className="h-4 w-4 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/bolao"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-amber-400/45 bg-black/40 px-5 text-sm font-bold uppercase tracking-wide text-amber-100 backdrop-blur-sm transition duration-300 hover:border-amber-300/70 hover:bg-amber-500/10 hover:shadow-[0_0_32px_-8px_rgba(245,158,11,0.28)] active:scale-[0.99]"
              >
                <Trophy className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={2.2} />
                Bolão Copa 2026
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <Link
                href="/tips"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 transition hover:text-amber-200"
              >
                Tips do dia
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/analises"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 transition hover:text-amber-200"
              >
                Análises
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <ul className="mt-12 grid max-w-md grid-cols-3 gap-2 sm:mt-14 sm:gap-3">
            {STATS.map(({ value, label, detail }) => (
              <li key={label}>
                <div
                  className="flex flex-col rounded-xl border border-white/[0.08] bg-zinc-950/50 p-3 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-[0_12px_40px_-16px_rgba(245,158,11,0.2)] sm:p-4"
                >
                  <span className="font-display text-[clamp(1.1rem,3.5vw,1.5rem)] font-bold tabular-nums leading-none text-amber-400">
                    {value}
                  </span>
                  <span className="mt-1.5 text-[10px] font-semibold uppercase leading-tight tracking-wide text-zinc-300 sm:text-[11px]">
                    {label}
                  </span>
                  <span className="mt-0.5 text-[9px] text-zinc-600 sm:text-[10px]">{detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
