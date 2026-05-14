import Link from "next/link";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { formatAnalisePublicadaDate } from "@/components/analises/portal/date-label";
import { siteConfig } from "@/config/site";

type Props = {
  /** Itens compactos (ex.: após o destaque, para não duplicar o hero). */
  itens: AnaliseRow[];
};

export function AnalisesSidebar({ itens }: Props) {
  const tg = siteConfig.social.telegram;

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
      <div className="rounded-2xl border border-[#3d3420]/80 bg-[#0c0b09]/95 p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,.75)]">
        <h3 className="border-b border-[#2a2418] pb-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-[#E8D48B]">
          Últimas análises
        </h3>
        {itens.length === 0 ? (
          <p className="pt-4 text-sm text-zinc-500">Sem outras análises ainda.</p>
        ) : (
          <ul className="divide-y divide-[#2a2418]/80">
            {itens.map((a) => {
              const dataFmt = formatAnalisePublicadaDate(a.created_at);
              const oddFmt = oddParaNumero(a.odd).toFixed(2);
              return (
                <li key={a.id} className="py-4 first:pt-4">
                  <Link
                    href={`/analise/${encodeURIComponent(a.slug)}`}
                    className="group block rounded-lg outline-none transition hover:bg-[#14120e]/80 focus-visible:ring-2 focus-visible:ring-[#C9A227]/50"
                  >
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white transition group-hover:text-[#E8D48B]">
                      {a.titulo}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {a.time_casa} × {a.time_fora}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase text-zinc-500">
                      <span className="text-emerald-400/90">Odd {oddFmt}</span>
                      <span className="text-amber-200/80">{a.confianca}%</span>
                      {dataFmt ? <span>{dataFmt}</span> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-[#C9A227]/35 bg-gradient-to-br from-[#1a1610] to-[#0c0b09] p-6 shadow-[0_24px_60px_-28px_rgba(212,175,55,.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#E8D48B]">
          Canal oficial
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Receba prognósticos, avisos e conteúdo em tempo real no Telegram da
          BarbosaTips.
        </p>
        <a
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#229ED9] py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          Entrar no Telegram
        </a>
      </div>
    </aside>
  );
}
