import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { AnaliseCategoriaTags } from "@/components/analises/portal/AnaliseCategoriaTags";
import { formatAnalisePublicadaDate } from "@/components/analises/portal/date-label";
import { AnaliseTierBadges } from "@/components/premium/AnaliseTierBadges";
import { FavoriteHeartButton } from "@/components/engagement/FavoriteHeartButton";

type Props = { analise: AnaliseRow; viewerCanViewPremium?: boolean };

export function AnaliseCardGrid({
  analise,
  viewerCanViewPremium = true,
}: Props) {
  const oddFmt = oddParaNumero(analise.odd).toFixed(2);
  const dataFmt = formatAnalisePublicadaDate(analise.created_at);
  const lockedPreview = analise.is_premium && !viewerCanViewPremium;

  return (
    <article className="commercial-card-elevated group flex h-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:border-gold-400/32 hover:shadow-[0_28px_70px_-24px_rgba(201,162,39,0.12)]">
      <div className="relative">
        <div className="absolute right-3 top-3 z-20">
          <FavoriteHeartButton kind="analise" refId={analise.slug} />
        </div>
        {analise.is_premium ? (
          <div className="absolute left-3 top-3 z-10">
            <AnaliseTierBadges analise={analise} compact />
          </div>
        ) : null}
        <AnaliseCapaMedia analise={analise} aspectClass="aspect-[16/10]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-400/95">
          {analise.campeonato || "Campeonato"}
        </p>
        <AnaliseCategoriaTags
          categoria={analise.categoria}
          tags={analise.tags}
        />
        <p className="text-xs font-semibold text-cream-muted">
          {analise.time_casa}{" "}
          <span className="text-stone-600" aria-hidden>
            ×
          </span>{" "}
          {analise.time_fora}
        </p>
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-cream">
          {analise.titulo}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-emerald-400/35 bg-emerald-500/12 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-200">
            Odd {oddFmt}
          </span>
          <span className="rounded-md border border-gold-400/28 bg-gold-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-100">
            Confiança {analise.confianca}%
          </span>
        </div>
        <p
          className={cn(
            "line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500",
            lockedPreview && "select-none blur-[5px]",
          )}
        >
          {analise.resumo?.trim() || "Resumo em breve."}
        </p>
        {dataFmt ? (
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-600">
            {dataFmt}
          </p>
        ) : null}
        <Link
          href={`/analise/${encodeURIComponent(analise.slug)}`}
          className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 via-gold-300 to-gold-400 py-2.5 text-sm font-bold text-pitch-950 shadow-gold-sm transition duration-300 hover:brightness-110"
        >
          {lockedPreview ? "Pré-visualizar" : "Ler análise"}
        </Link>
      </div>
    </article>
  );
}
