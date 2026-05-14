import Link from "next/link";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { AnaliseCategoriaTags } from "@/components/analises/portal/AnaliseCategoriaTags";
import { formatAnalisePublicadaDate } from "@/components/analises/portal/date-label";

type Props = { analise: AnaliseRow };

export function AnaliseCardGrid({ analise }: Props) {
  const oddFmt = oddParaNumero(analise.odd).toFixed(2);
  const dataFmt = formatAnalisePublicadaDate(analise.created_at);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2a2418]/90 bg-gradient-to-b from-[#12100c] to-[#070605] shadow-[0_20px_50px_-28px_rgba(0,0,0,.85)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#C9A227]/40 hover:shadow-[0_28px_70px_-24px_rgba(212,175,55,.14)]">
      <AnaliseCapaMedia analise={analise} aspectClass="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9A227]/90">
          {analise.campeonato || "Campeonato"}
        </p>
        <AnaliseCategoriaTags
          categoria={analise.categoria}
          tags={analise.tags}
        />
        <p className="text-xs font-semibold text-zinc-300">
          {analise.time_casa}{" "}
          <span className="text-zinc-600" aria-hidden>
            ×
          </span>{" "}
          {analise.time_fora}
        </p>
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-white">
          {analise.titulo}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            Odd {oddFmt}
          </span>
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
            Confiança {analise.confianca}%
          </span>
        </div>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500">
          {analise.resumo?.trim() || "Resumo em breve."}
        </p>
        {dataFmt ? (
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {dataFmt}
          </p>
        ) : null}
        <Link
          href={`/analise/${encodeURIComponent(analise.slug)}`}
          className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-2.5 text-sm font-bold text-[#0a0a0a] transition duration-300 hover:brightness-110"
        >
          Ler análise
        </Link>
      </div>
    </article>
  );
}
