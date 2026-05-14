import Link from "next/link";
import { Lock, Send, Youtube } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { formatAnalisePublicadaDate } from "@/components/analises/portal/date-label";
import { siteConfig } from "@/config/site";

type Props = {
  /** Itens compactos (ex.: após o destaque, para não duplicar o hero). */
  itens: AnaliseRow[];
  viewerCanViewPremium?: boolean;
};

export function AnalisesSidebar({
  itens,
  viewerCanViewPremium = true,
}: Props) {
  const { hub, social } = siteConfig;

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
              const locked = a.is_premium && !viewerCanViewPremium;
              return (
                <li key={a.id} className="py-4 first:pt-4">
                  <Link
                    href={`/analise/${encodeURIComponent(a.slug)}`}
                    className="group block rounded-lg outline-none transition hover:bg-[#14120e]/80 focus-visible:ring-2 focus-visible:ring-[#C9A227]/50"
                  >
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white transition group-hover:text-[#E8D48B]">
                      {locked ? (
                        <Lock
                          className="mr-1 inline-block h-3.5 w-3.5 shrink-0 text-amber-400/90"
                          strokeWidth={2.5}
                          aria-label="Premium"
                        />
                      ) : null}
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
          Canal e grupo
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Avisos oficiais no canal; conversa e alertas rápidos no grupo — o mesmo rigor BarbosaTips.
        </p>
        <a
          href={hub.telegramCanal}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          <Send className="h-4 w-4 shrink-0" aria-hidden />
          Canal Telegram
        </a>
        <a
          href={hub.telegramGrupo}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center rounded-xl border border-sky-500/30 bg-sky-950/25 py-2.5 text-xs font-bold text-sky-100 transition hover:border-sky-400/45"
        >
          Grupo Telegram
        </a>
      </div>

      <div className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/25 to-[#0c0b09] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,.75)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-300/90">YouTube</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Análises em vídeo, resumos e shorts no canal oficial.
        </p>
        <a
          href={hub.youtubeCanalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-950/30 py-3 text-sm font-bold text-red-50 transition hover:border-red-400/50"
        >
          <Youtube className="h-4 w-4 shrink-0" aria-hidden />
          Ver canal
        </a>
        <Link
          href="/comunidade"
          className="mt-3 block text-center text-xs font-semibold text-gold-300/90 underline-offset-2 hover:underline"
        >
          Hub comunidade →
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0c0b09]/90 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Mais redes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 transition hover:border-pink-500/30 hover:text-pink-200"
          >
            Instagram
          </a>
          <a
            href={social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 transition hover:text-zinc-200"
          >
            X
          </a>
        </div>
      </div>
    </aside>
  );
}
