import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { cn } from "@/lib/utils";

type Props = {
  analises: AnaliseRow[];
  viewerCanViewPremium?: boolean;
  layout?: "grid" | "sidebar";
};

function SidebarCard({
  a,
  locked,
}: {
  a: AnaliseRow;
  locked: boolean;
}) {
  const oddFmt = oddParaNumero(a.odd).toFixed(2);

  return (
    <article className="commercial-card-elevated group flex gap-3 overflow-hidden p-2.5 transition duration-300 hover:border-gold-400/28 sm:p-3">
      <div className="relative w-[88px] shrink-0 overflow-hidden rounded-xl sm:w-[96px]">
        {a.is_premium ? (
          <div className="absolute left-1 top-1 z-10 scale-90">
            <PremiumLockBadge />
          </div>
        ) : null}
        <AnaliseCapaMedia analise={a} aspectClass="aspect-square h-full w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gold-400/90 line-clamp-1">
          {a.campeonato || "Editorial"}
        </p>
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-cream group-hover:text-gold-100">
          {a.titulo}
        </h3>
        <p className="text-[11px] text-stone-500 line-clamp-1">
          {a.time_casa} × {a.time_fora}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
            @{oddFmt}
          </span>
          <span className="text-[9px] font-bold text-gold-200/90">{a.confianca}%</span>
        </div>
        <Link
          href={`/analise/${encodeURIComponent(a.slug)}`}
          className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-300"
        >
          {locked ? "Pré-visualizar" : "Ler"}
          <ChevronRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function HomeDestaquesSecundarios({
  analises,
  viewerCanViewPremium = true,
  layout = "grid",
}: Props) {
  if (analises.length === 0) return null;

  const isSidebar = layout === "sidebar";

  return (
    <section className="relative" aria-labelledby="home-destaques-secundarios">
      <div
        className={cn(
          "mb-4 flex flex-col gap-2",
          !isSidebar && "sm:flex-row sm:items-end sm:justify-between",
        )}
      >
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400/95">
            <Star className="h-3.5 w-3.5" aria-hidden />
            {isSidebar ? "Mais destaques" : "Editorial em destaque"}
          </p>
          <h2
            id="home-destaques-secundarios"
            className={cn(
              "mt-1 font-display font-bold tracking-tight text-cream",
              isSidebar ? "text-lg" : "text-xl sm:text-2xl",
            )}
          >
            {isSidebar ? (
              "Na mesma leitura"
            ) : (
              <>
                Destaques <span className="text-gold-gradient">secundários</span>
              </>
            )}
          </h2>
        </div>
        <Link
          href="/analises"
          className="text-xs font-semibold text-gold-300/90 underline-offset-2 hover:underline sm:text-sm"
        >
          Ver todas →
        </Link>
      </div>

      {isSidebar ? (
        <ul className="flex flex-col gap-3">
          {analises.map((a) => {
            const locked = a.is_premium && !viewerCanViewPremium;
            return (
              <li key={a.id}>
                <SidebarCard a={a} locked={locked} />
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {analises.map((a) => {
            const oddFmt = oddParaNumero(a.odd).toFixed(2);
            const locked = a.is_premium && !viewerCanViewPremium;
            return (
              <li key={a.id}>
                <article className="commercial-card-elevated group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/30">
                  <div className="relative">
                    {a.is_premium ? (
                      <div className="absolute left-2 top-2 z-10">
                        <PremiumLockBadge />
                      </div>
                    ) : null}
                    <AnaliseCapaMedia analise={a} aspectClass="aspect-[16/10]" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-400/90">
                      {a.campeonato || "Campeonato"}
                    </p>
                    <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-cream group-hover:text-gold-100">
                      {a.titulo}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {a.time_casa} × {a.time_fora}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                      <span className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                        @{oddFmt}
                      </span>
                      <span className="rounded-md border border-gold-400/25 bg-gold-400/10 px-2 py-0.5 text-[10px] font-bold text-gold-100">
                        {a.confianca}%
                      </span>
                    </div>
                    <Link
                      href={`/analise/${encodeURIComponent(a.slug)}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gold-300 transition group-hover:text-gold-200"
                    >
                      {locked ? "Pré-visualizar" : "Ler análise"}
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
