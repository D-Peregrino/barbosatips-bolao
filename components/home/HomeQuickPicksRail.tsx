import Link from "next/link";
import type { QuickPickRow } from "@/lib/picks/types";
import { cn } from "@/lib/utils";
import { rotuloEsporte, iconeEsporte } from "@/lib/picks/rotulo-esporte";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { relativeTimeAgoPt } from "@/lib/live/time-ago";

type Props = {
  picks: QuickPickRow[];
  viewerCanViewPremium: boolean;
  embedded?: boolean;
};

function resultadoVisual(p: QuickPickRow, locked: boolean): string {
  if (locked) return "·";
  if (p.status === "ativo") return "AO VIVO";
  if (p.resultado === "green") return "GREEN";
  if (p.resultado === "red") return "RED";
  if (p.resultado === "void") return "VOID";
  return "—";
}

function railCardClass(p: QuickPickRow, locked: boolean): string {
  if (locked) return "border-gold-400/20 bg-black/40";
  if (p.status === "ativo") return "border-gold-400/35 bg-gold-400/[0.06]";
  if (p.resultado === "green")
    return "border-emerald-400/40 bg-emerald-950/25 shadow-[0_0_24px_-10px_rgba(52,211,153,0.25)]";
  if (p.resultado === "red")
    return "border-rose-400/35 bg-rose-950/25 shadow-[0_0_20px_-10px_rgba(251,113,133,0.18)]";
  return "border-gold-400/15 bg-pitch-900/80";
}

export function HomeQuickPicksRail({ picks, viewerCanViewPremium, embedded = false }: Props) {
  if (picks.length === 0) return null;

  const rail = (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-[#08090e] to-transparent sm:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-[#08090e] to-transparent sm:w-14" />

      <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 pt-1 sm:px-6 lg:px-8">
        {picks.map((p) => {
          const locked = p.is_premium && !viewerCanViewPremium;
          const oddStr = p.odd.toFixed(2).replace(".", ",");
          const res = resultadoVisual(p, locked);
          const quando = relativeTimeAgoPt(p.created_at);
          return (
            <li
              key={p.id}
              className="snap-start"
              style={{ minWidth: "min(88vw, 380px)", maxWidth: "400px", flex: "0 0 auto" }}
            >
              <Link
                href={`/pick/${encodeURIComponent(p.id)}`}
                className={cn(
                  "flex h-full min-h-[148px] flex-row overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5",
                  railCardClass(p, locked),
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-between pr-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
                      <span>
                        {iconeEsporte(p.esporte)} {rotuloEsporte(p.esporte)}
                      </span>
                      {p.campeonato?.trim() ? (
                        <span className="text-stone-600">· {p.campeonato.trim()}</span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-left text-base font-bold leading-snug text-cream">
                      {p.jogo}
                    </p>
                    <p className="mt-1 line-clamp-1 text-left text-xs text-stone-500">
                      {p.mercado}
                      <span className="text-stone-600"> · {quando}</span>
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {p.is_premium ? <PremiumLockBadge className="scale-90" /> : null}
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Conf. {p.confianca}%
                    </span>
                  </div>
                </div>
                <div className="flex w-[112px] shrink-0 flex-col items-end justify-between border-l border-white/5 pl-3">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wide",
                      locked && "border-stone-600 text-stone-500",
                      !locked && p.status === "ativo" && "border-gold-400/40 text-gold-200",
                      !locked && p.resultado === "green" && "border-emerald-400/50 text-emerald-200",
                      !locked && p.resultado === "red" && "border-rose-400/50 text-rose-100",
                      !locked &&
                        p.resultado !== "green" &&
                        p.resultado !== "red" &&
                        p.status !== "ativo" &&
                        "border-stone-600 text-stone-400",
                    )}
                  >
                    {res}
                  </span>
                  <span className="odd-pill mt-2 text-xl sm:text-2xl">@{oddStr}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (embedded) {
    return <div aria-label="Picks rápidas">{rail}</div>;
  }

  return (
    <section aria-labelledby="home-rail-picks">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400/95">
            Linhas rápidas
          </p>
          <h2
            id="home-rail-picks"
            className="mt-1 font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl"
          >
            Picks <span className="text-gold-gradient">rápidas</span>
          </h2>
        </div>
        <Link
          href="/picks"
          className="inline-flex items-center gap-1 text-sm font-bold text-gold-300 transition hover:text-gold-200"
        >
          Ver todas →
        </Link>
      </div>
      {rail}
    </section>
  );
}
