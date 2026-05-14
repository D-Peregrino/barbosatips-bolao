import Link from "next/link";
import type { QuickPickRow } from "@/lib/picks/types";
import { rotuloEsporte, iconeEsporte } from "@/lib/picks/rotulo-esporte";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";

type Props = {
  picks: QuickPickRow[];
  viewerCanViewPremium: boolean;
};

export function TipsterPicksSection({ picks, viewerCanViewPremium }: Props) {
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="tipster-picks">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400/95">Linhas</p>
          <h2 id="tipster-picks" className="mt-1 font-display text-2xl font-bold text-cream">
            Últimas picks
          </h2>
        </div>
        <Link href="/picks" className="text-sm font-semibold text-gold-300 hover:underline">
          Ver todas →
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((p) => {
          const locked = p.is_premium && !viewerCanViewPremium;
          return (
            <li key={p.id}>
              <Link
                href="/picks"
                className="commercial-card-elevated flex h-full flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-gold-400/25"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-stone-500">
                    {iconeEsporte(p.esporte)} {rotuloEsporte(p.esporte)}
                  </span>
                  {p.is_premium ? <PremiumLockBadge className="scale-90" /> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-base font-bold leading-snug text-cream">{p.jogo}</p>
                <p className="mt-1 line-clamp-1 text-xs text-stone-500">{p.mercado}</p>
                <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] uppercase tracking-wide text-stone-500">
                    Conf. {p.confianca}%
                  </span>
                  <span
                    className={`font-mono text-2xl font-black tabular-nums ${locked ? "blur-sm opacity-60" : "text-gold-200"}`}
                  >
                    @{p.odd.toFixed(2)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
