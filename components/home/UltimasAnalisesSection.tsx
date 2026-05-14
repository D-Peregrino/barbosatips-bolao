import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";

type Props = {
  analises: AnaliseRow[];
  viewerCanViewPremium?: boolean;
};

const btnGold =
  "inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-2.5 text-sm font-bold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition hover:brightness-110";

function labelCategoria(a: AnaliseRow): string {
  const c = a.categoria?.trim();
  return c || "Editorial";
}

function CardDestaque({
  analise: a,
  viewerCanViewPremium = true,
}: {
  analise: AnaliseRow;
  viewerCanViewPremium?: boolean;
}) {
  const oddFmt = oddParaNumero(a.odd).toFixed(2);
  const lockedPreview = a.is_premium && !viewerCanViewPremium;
  return (
    <article className="group flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#3d3420]/80 bg-gradient-to-br from-[#14120e] via-[#0c0b09] to-[#050608] shadow-[0_32px_80px_-28px_rgba(0,0,0,.88)] transition duration-500 hover:border-[#C9A227]/45 lg:flex-row">
      <div className="relative min-h-[220px] shrink-0 lg:w-[48%] lg:min-h-[300px]">
        {a.is_premium ? (
          <div className="absolute left-4 top-4 z-10">
            <PremiumLockBadge />
          </div>
        ) : null}
        <AnaliseCapaMedia
          analise={a}
          aspectClass="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[300px]"
          minHeightClass="min-h-[200px] lg:min-h-0"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:gap-5 sm:p-8 lg:max-w-none">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C9A227]">
          {labelCategoria(a)}
        </p>
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-[1.65rem] lg:leading-snug">
          {a.titulo}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
            Odd {oddFmt}
          </span>
          <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-200">
            Confiança {a.confianca}%
          </span>
        </div>
        <p
          className={cn(
            "line-clamp-4 text-sm leading-relaxed text-zinc-400 sm:text-[15px]",
            lockedPreview && "select-none blur-[6px]",
          )}
        >
          {a.resumo?.trim() || "Leitura de mercado e contexto do confronto."}
        </p>
        <Link
          href={`/analise/${encodeURIComponent(a.slug)}`}
          className={`${btnGold} mt-auto max-w-xs sm:py-3`}
        >
          {lockedPreview ? "Pré-visualizar" : "Ler análise"}
        </Link>
      </div>
    </article>
  );
}

function CardCompacta({
  analise: a,
  viewerCanViewPremium = true,
}: {
  analise: AnaliseRow;
  viewerCanViewPremium?: boolean;
}) {
  const oddFmt = oddParaNumero(a.odd).toFixed(2);
  const lockedPreview = a.is_premium && !viewerCanViewPremium;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2a2418]/90 bg-gradient-to-b from-[#12100c] to-[#070605] shadow-[0_20px_50px_-28px_rgba(0,0,0,.85)] transition hover:border-[#C9A227]/40 hover:shadow-[0_24px_60px_-24px_rgba(212,175,55,.12)]">
      <div className="relative">
        {a.is_premium ? (
          <div className="absolute left-3 top-3 z-10">
            <PremiumLockBadge />
          </div>
        ) : null}
        <AnaliseCapaMedia analise={a} aspectClass="aspect-[16/10]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9A227]/90">
          {labelCategoria(a)}
        </p>
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-white sm:text-lg">
          {a.titulo}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase text-emerald-300">
            Odd {oddFmt}
          </span>
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase text-amber-200">
            Confiança {a.confianca}%
          </span>
        </div>
        <p
          className={cn(
            "line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500",
            lockedPreview && "select-none blur-[5px]",
          )}
        >
          {a.resumo?.trim() || "Resumo em breve."}
        </p>
        <Link href={`/analise/${encodeURIComponent(a.slug)}`} className={`${btnGold} mt-auto`}>
          {lockedPreview ? "Pré-visualizar" : "Ler análise"}
        </Link>
      </div>
    </article>
  );
}

/**
 * Secção "Últimas Análises" na home — destaque + até duas cards compactas.
 */
export function UltimasAnalisesSection({
  analises,
  viewerCanViewPremium = true,
}: Props) {
  const destaque = analises[0];
  const segunda = analises[1];
  const terceira = analises[2];
  const n = analises.length;

  return (
    <section
      className="relative border-t border-[#2a2418]/90 bg-[#030201] px-4 py-14 sm:py-20"
      aria-labelledby="ultimas-analises-titulo"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(201,162,39,.1),transparent_55%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Portal editorial
            </p>
            <h2
              id="ultimas-analises-titulo"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Últimas Análises
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
              Prognósticos recentes com odd sugerida e nível de confiança — mesmo
              padrão premium do portal.
            </p>
          </div>
          <Link
            href="/analises"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-[#C9A227]/50 bg-[#12100c] px-6 py-3 text-sm font-bold text-[#E8D48B] shadow-[0_8px_32px_-12px_rgba(212,175,55,.25)] transition hover:border-[#E8D48B] hover:bg-[#1a1610] hover:text-white"
          >
            Ver todas as análises
          </Link>
        </div>

        {n === 0 ? (
          <p className="rounded-2xl border border-[#3d3420]/60 bg-[#0c0b09]/80 px-6 py-10 text-center text-sm text-zinc-500">
            Em breve as primeiras análises aparecem aqui. Explore o{" "}
            <Link href="/analises" className="font-semibold text-[#C9A227] underline-offset-2 hover:underline">
              arquivo completo
            </Link>
            .
          </p>
        ) : n === 1 ? (
          <CardDestaque analise={destaque} viewerCanViewPremium={viewerCanViewPremium} />
        ) : n === 2 ? (
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <CardDestaque analise={destaque} viewerCanViewPremium={viewerCanViewPremium} />
            </div>
            <div className="lg:col-span-1">
              <CardCompacta analise={segunda} viewerCanViewPremium={viewerCanViewPremium} />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 lg:grid-rows-2 lg:gap-8">
            <div className="min-h-0 lg:col-span-2 lg:row-span-2">
              <CardDestaque analise={destaque} viewerCanViewPremium={viewerCanViewPremium} />
            </div>
            <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1">
              <CardCompacta analise={segunda} viewerCanViewPremium={viewerCanViewPremium} />
            </div>
            <div className="lg:col-span-1 lg:col-start-3 lg:row-start-2">
              <CardCompacta analise={terceira} viewerCanViewPremium={viewerCanViewPremium} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
