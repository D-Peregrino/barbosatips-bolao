import Link from "next/link";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { rotuloEsporte, iconeEsporte } from "@/lib/picks/rotulo-esporte";

type Props = {
  analises: AnaliseRow[];
  viewerCanViewPremium: boolean;
};

export function TipsterAnalisesSection({ analises, viewerCanViewPremium }: Props) {
  if (analises.length === 0) return null;

  return (
    <section aria-labelledby="tipster-analises">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400/95">Editorial</p>
          <h2 id="tipster-analises" className="mt-1 font-display text-2xl font-bold text-cream">
            Últimas análises
          </h2>
        </div>
        <Link href="/analises" className="text-sm font-semibold text-gold-300 hover:underline">
          Arquivo →
        </Link>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {analises.map((a) => {
          const odd = oddParaNumero(a.odd).toFixed(2);
          const locked = a.is_premium && !viewerCanViewPremium;
          return (
            <li key={a.id}>
              <article className="commercial-card-elevated flex h-full flex-col overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:border-gold-400/25">
                <div className="relative">
                  {a.is_premium ? (
                    <div className="absolute left-3 top-3 z-10">
                      <PremiumLockBadge />
                    </div>
                  ) : null}
                  <AnaliseCapaMedia analise={a} aspectClass="aspect-[16/10]" />
                  <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8">
                    <span className="rounded-full border border-white/10 bg-black/55 px-2 py-0.5 text-[10px] font-bold text-cream/95 backdrop-blur-sm">
                      {iconeEsporte(a.esporte)} {rotuloEsporte(a.esporte)}
                    </span>
                    {a.campeonato?.trim() ? (
                      <span className="rounded-full border border-gold-400/20 bg-black/50 px-2 py-0.5 text-[10px] text-gold-100/90 backdrop-blur-sm">
                        {a.campeonato.trim()}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-cream">
                    {a.titulo}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                      @{odd}
                    </span>
                    <span className="rounded-md border border-gold-400/25 bg-gold-400/8 px-2 py-0.5 text-gold-100">
                      Conf. {a.confianca}%
                    </span>
                  </div>
                  <Link
                    href={`/analise/${encodeURIComponent(a.slug)}`}
                    className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 via-gold-300 to-gold-400 py-2.5 text-sm font-bold text-pitch-950 transition hover:brightness-110"
                  >
                    {locked ? "Pré-visualizar" : "Ler análise"}
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
