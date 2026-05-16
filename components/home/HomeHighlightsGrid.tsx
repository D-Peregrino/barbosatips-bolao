import Link from "next/link";
import type { ReactNode } from "react";
import { Flame, TrendingUp, Trophy, Newspaper } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { oddParaNumero } from "@/lib/analises/types";
import { relativeTimeAgoPt } from "@/lib/live/time-ago";
import { cn } from "@/lib/utils";

type ColProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

function HighlightColumn({ title, icon, children }: ColProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/10 text-gold-300">
          {icon}
        </span>
        <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-cream">
          {title}
        </h3>
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
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
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/25 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-stone-200">{title}</p>
        <p className="mt-2 text-xs leading-relaxed text-stone-500">{body}</p>
        <Link
          href={href}
          className="mt-4 inline-flex min-h-[40px] items-center text-xs font-bold uppercase tracking-wide text-gold-300 hover:underline"
        >
          {cta} →
        </Link>
      </div>
    </li>
  );
}

function pickStatusBadge(pick: QuickPickRow): { label: string; className: string } {
  if (pick.status === "ativo") {
    return { label: "AO VIVO", className: "border-gold-400/40 text-gold-200 bg-gold-400/10" };
  }
  if (pick.resultado === "green") {
    return { label: "GREEN", className: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10" };
  }
  if (pick.resultado === "red") {
    return { label: "RED", className: "border-rose-400/40 text-rose-100 bg-rose-950/40" };
  }
  return { label: "VOID", className: "border-stone-600/50 text-stone-400 bg-black/30" };
}

function PickLine({ pick }: { pick: QuickPickRow }) {
  const oddRaw = typeof pick.odd === "number" ? pick.odd : Number(pick.odd);
  const oddSafe = Number.isFinite(oddRaw) ? oddRaw : 0;
  const when = relativeTimeAgoPt(pick.created_at);
  const badge = pickStatusBadge(pick);

  return (
    <li>
      <Link href={`/pick/${encodeURIComponent(pick.id)}`} className="sport-pick-row group">
        <div className="odd-pill text-base sm:text-lg">@{oddSafe.toFixed(2)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
                badge.className,
              )}
            >
              {badge.label}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-stone-600">
              {when}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-cream group-hover:text-gold-100">
            {pick.jogo}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{pick.mercado}</p>
        </div>
      </Link>
    </li>
  );
}

function AnaliseLine({ a }: { a: AnaliseRow }) {
  const odd = oddParaNumero(a.odd).toFixed(2);
  const when = relativeTimeAgoPt(a.created_at);

  return (
    <li>
      <Link href={`/analise/${encodeURIComponent(a.slug)}`} className="sport-pick-row group">
        <div className="odd-pill text-base sm:text-lg">@{odd}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-violet-400/30 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-200">
              Análise
            </span>
            <span className="text-[10px] font-medium text-stone-600">
              {a.confianca}% · {when}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-cream group-hover:text-gold-100">
            {a.titulo}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
            {a.time_casa} × {a.time_fora}
          </p>
        </div>
      </Link>
    </li>
  );
}

type Props = {
  analises: AnaliseRow[];
  picksQuentes: QuickPickRow[];
  melhoresGreens: QuickPickRow[];
  trending: QuickPickRow[];
  /** Sem cabeçalho de secção (quando envolvido em HomeSectionShell) */
  embedded?: boolean;
};

export function HomeHighlightsGrid({
  analises,
  picksQuentes,
  melhoresGreens,
  trending,
  embedded = false,
}: Props) {
  const grid = (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <HighlightColumn title="Análises recentes" icon={<Newspaper className="h-4 w-4" aria-hidden />}>
        {analises.length === 0 ? (
          <ColumnEmpty
            title="Editorial a aquecer"
            body="Novos prognósticos entram assim que a equipa publicar."
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
  );

  if (embedded) {
    return <div aria-label="Destaques do mercado">{grid}</div>;
  }

  return (
    <section className="relative" aria-labelledby="highlights-heading">
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
      {grid}
    </section>
  );
}
