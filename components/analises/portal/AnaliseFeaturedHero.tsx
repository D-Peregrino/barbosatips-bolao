import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { AnaliseCategoriaTags } from "@/components/analises/portal/AnaliseCategoriaTags";
import { formatAnalisePublicadaDate } from "@/components/analises/portal/date-label";
import { AnaliseTierBadges } from "@/components/premium/AnaliseTierBadges";

type Props = { analise: AnaliseRow; viewerCanViewPremium?: boolean };

export function AnaliseFeaturedHero({
  analise,
  viewerCanViewPremium = true,
}: Props) {
  const oddFmt = oddParaNumero(analise.odd).toFixed(2);
  const dataFmt = formatAnalisePublicadaDate(analise.created_at);
  const lockedPreview = analise.is_premium && !viewerCanViewPremium;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[#3d3420]/80 bg-gradient-to-br from-[#14120e] via-[#0c0b09] to-[#050608] shadow-[0_32px_80px_-24px_rgba(0,0,0,.9)] transition duration-500 ease-out hover:border-[#C9A227]/45 hover:shadow-[0_40px_100px_-28px_rgba(212,175,55,.12)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative min-h-[220px] lg:min-h-[340px]">
          {analise.is_premium ? (
            <div className="absolute left-4 top-4 z-10">
              <AnaliseTierBadges analise={analise} compact />
            </div>
          ) : null}
          <AnaliseCapaMedia
            analise={analise}
            aspectClass="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[340px]"
            minHeightClass="min-h-[220px] lg:min-h-0"
          />
        </div>

        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C9A227]">
              Destaque · {analise.campeonato || "Campeonato"}
            </p>
            <div className="mt-2">
              <AnaliseCategoriaTags
                categoria={analise.categoria}
                tags={analise.tags}
                variant="hero"
              />
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[1.85rem] lg:leading-snug">
              {analise.titulo}
            </h2>
            <p className="mt-3 text-base font-semibold text-zinc-200">
              {analise.time_casa}{" "}
              <span className="text-zinc-600" aria-hidden>
                ×
              </span>{" "}
              {analise.time_fora}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
              Odd {oddFmt}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-amber-200">
              Confiança {analise.confianca}%
            </span>
            {dataFmt ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {dataFmt}
              </span>
            ) : null}
          </div>

          <p
            className={cn(
              "line-clamp-4 text-sm leading-relaxed text-zinc-400 sm:text-[15px]",
              lockedPreview && "select-none blur-[6px]",
            )}
          >
            {analise.resumo?.trim() || "Análise com leitura de mercado e contexto do confronto."}
          </p>

          <Link
            href={`/analise/${encodeURIComponent(analise.slug)}`}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-3.5 text-sm font-bold text-[#0a0a0a] shadow-[0_16px_48px_-12px_rgba(212,175,55,.5)] transition duration-300 hover:brightness-110 hover:shadow-[0_20px_56px_-12px_rgba(212,175,55,.55)] sm:w-auto sm:px-10"
          >
            {lockedPreview ? "Pré-visualizar" : "Ler análise"}
          </Link>
        </div>
      </div>
    </article>
  );
}
