import Link from "next/link";
import type { ReactNode } from "react";
import { Flame, TrendingUp, Trophy, Newspaper } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { oddParaNumero } from "@/lib/analises/types";

type ColProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

function HighlightColumn({ title, icon, children }: ColProps) {
  return (
    <div className="commercial-card-elevated flex flex-col rounded-2xl border p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-gold-400/10 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/20 bg-gold-400/5 text-gold-300">
          {icon}
        </span>
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-cream">
          {title}
        </h2>
      </div>
      <ul className="flex flex-1 flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function ColumnEmpty({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <li className="list-none">
      <div className="rounded-xl border border-dashed border-gold-400/18 bg-black/30 px-4 py-8 text-center">
        <p className="text-[13px] font-semibold leading-snug text-stone-100">{title}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-stone-400">{body}</p>
        <Link
          href={href}
          className="mt-4 inline-flex min-h-[40px] items-center justify-center text-xs font-extrabold uppercase tracking-wide text-gold-300 underline-offset-4 hover:underline"
        >
          {cta} →
        </Link>
      </div>
    </li>
  );
}

function PickLine({ pick }: { pick: QuickPickRow }) {
  const badge =
    pick.status === "ativo"
      ? "text-gold-200 border-gold-400/30 bg-gold-400/10"
      : pick.resultado === "green"
        ? "text-emerald-200 border-emerald-400/35 bg-emerald-500/10"
        : pick.resultado === "red"
          ? "text-rose-100 border-rose-400/35 bg-rose-950/35"
          : "text-stone-400 border-stone-600/40 bg-black/30";

  return (
    <li>
      <Link
        href={`/pick/${encodeURIComponent(pick.id)}`}
        className="group block rounded-xl border border-transparent px-2 py-2 transition hover:border-gold-400/20 hover:bg-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-cream group-hover:text-gold-100">
            {pick.jogo}
          </span>
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums ${badge}`}
          >
            @{pick.odd.toFixed(2)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">{pick.mercado}</p>
      </Link>
    </li>
  );
}

function AnaliseLine({ a }: { a: AnaliseRow }) {
  const odd = oddParaNumero(a.odd).toFixed(2);
  return (
    <li>
      <Link
        href={`/analise/${encodeURIComponent(a.slug)}`}
        className="group block rounded-xl border border-transparent px-2 py-2 transition hover:border-gold-400/20 hover:bg-white/[0.03]"
      >
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-cream group-hover:text-gold-100">
          {a.titulo}
        </p>
        <p className="mt-0.5 text-[11px] text-stone-500">
          @{odd} · {a.confianca}%
        </p>
      </Link>
    </li>
  );
}

type Props = {
  analises: AnaliseRow[];
  picksQuentes: QuickPickRow[];
  melhoresGreens: QuickPickRow[];
  trending: QuickPickRow[];
};

export function HomeHighlightsGrid({
  analises,
  picksQuentes,
  melhoresGreens,
  trending,
}: Props) {
  return (
    <section
      className="relative"
      aria-labelledby="highlights-heading"
    >
      <div className="pointer-events-none absolute -inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/25 to-transparent sm:-inset-x-10" />

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400/95">
            Radar BarbosaTips
          </p>
          <h2
            id="highlights-heading"
            className="mt-1 font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl"
          >
            Destaques do <span className="text-gold-gradient">mercado</span>
          </h2>
        </div>
        <Link
          href="/analises"
          className="text-sm font-semibold text-gold-300/90 underline-offset-2 hover:underline"
        >
          Arquivo editorial →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HighlightColumn title="Análises recentes" icon={<Newspaper className="h-4 w-4" aria-hidden />}>
          {analises.length === 0 ? (
            <ColumnEmpty
              title="Editorial a aquecer"
              body="Novos prognósticos entram assim que a equipa publicar — o radar enche depressa."
              href="/analises"
              cta="Ver arquivo"
            />
          ) : (
            analises.map((a) => <AnaliseLine key={a.id} a={a} />)
          )}
        </HighlightColumn>

        <HighlightColumn title="Picks quentes" icon={<Flame className="h-4 w-4" aria-hidden />}>
          {picksQuentes.length === 0 ? (
            <ColumnEmpty
              title="Linhas em preparação"
              body="Quando houver picks ativas, aparecem aqui com odd e mercado."
              href="/picks"
              cta="Abrir picks"
            />
          ) : (
            picksQuentes.map((p) => <PickLine key={p.id} pick={p} />)
          )}
        </HighlightColumn>

        <HighlightColumn title="Melhores greens" icon={<Trophy className="h-4 w-4" aria-hidden />}>
          {melhoresGreens.length === 0 ? (
            <ColumnEmpty
              title="Sem greens fechados"
              body="Assim que picks encerrarem em verde, este quadro brilha."
              href="/performance"
              cta="Ver performance"
            />
          ) : (
            melhoresGreens.map((p) => <PickLine key={p.id} pick={p} />)
          )}
        </HighlightColumn>

        <HighlightColumn title="Trending" icon={<TrendingUp className="h-4 w-4" aria-hidden />}>
          {trending.length === 0 ? (
            <ColumnEmpty
              title="Trending calmo"
              body="Movimento de mercado e confiança alta — volta daqui a pouco."
              href="/comunidade"
              cta="Comunidade"
            />
          ) : (
            trending.map((p) => <PickLine key={p.id} pick={p} />)
          )}
        </HighlightColumn>
      </div>
    </section>
  );
}
