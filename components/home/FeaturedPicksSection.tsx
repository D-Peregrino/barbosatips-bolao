import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { QuickPickRow } from "@/lib/picks/types";
import { cn } from "@/lib/utils";

type Props = {
  picks: QuickPickRow[];
  viewerCanViewPremium: boolean;
};

function badge(p: QuickPickRow): { label: string; className: string } {
  if (p.status === "ativo") {
    return {
      label: "Ao vivo",
      className:
        "border-amber-400/45 bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/20",
    };
  }
  if (p.resultado === "green") {
    return {
      label: "Green",
      className: "border-emerald-500/40 bg-emerald-500/12 text-emerald-200",
    };
  }
  if (p.resultado === "red") {
    return { label: "Red", className: "border-red-500/40 bg-red-500/12 text-red-200" };
  }
  if (p.resultado === "void") {
    return { label: "Void", className: "border-zinc-500/45 bg-zinc-800/40 text-zinc-300" };
  }
  return {
    label: "Pendente",
    className: "border-amber-500/35 bg-amber-950/40 text-amber-100/90",
  };
}

function FeaturedPickCard({
  pick,
  locked,
}: {
  pick: QuickPickRow;
  locked: boolean;
}) {
  const b = badge(pick);
  const odd = Number(pick.odd).toFixed(2);

  return (
    <article
      className={cn(
        "group relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl border p-5 transition duration-300 ease-out",
        "border-white/[0.08] bg-gradient-to-br from-zinc-900/50 via-zinc-950/80 to-black",
        "hover:-translate-y-1 hover:border-amber-400/35",
        "hover:shadow-[0_20px_50px_-18px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(251,191,36,0.08)]",
        locked && "border-amber-600/25",
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            b.className,
          )}
        >
          {b.label}
        </span>
        <span className="font-display text-lg font-bold tabular-nums text-amber-300 drop-shadow-sm">
          @{odd}
        </span>
      </div>

      <h3 className="relative mt-3 font-display text-base font-bold leading-snug text-white transition group-hover:text-amber-50 sm:text-lg">
        {pick.jogo}
      </h3>
      <p className="relative mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
        {pick.mercado}
      </p>

      <div className="relative mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Conf. {pick.confianca}%
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400/90 transition group-hover:text-amber-300">
          Ver em picks
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      {locked ? (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center rounded-2xl bg-black/55 backdrop-blur-[2px]">
          <span className="rounded-full border border-amber-500/40 bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            Premium
          </span>
        </div>
      ) : null}

      <Link
        href="/picks"
        className="absolute inset-0 z-[1] rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={`Abrir picks: ${pick.jogo}`}
      />
    </article>
  );
}

function PlaceholderCard() {
  return (
    <article className="flex min-h-[168px] flex-col justify-center rounded-2xl border border-dashed border-amber-500/25 bg-zinc-950/40 p-5 text-center transition hover:border-amber-400/40 hover:bg-zinc-900/30">
      <p className="font-display text-sm font-bold text-zinc-300">Picks em breve</p>
      <p className="mt-2 text-xs text-zinc-500">
        Acompanhe o portal — novas linhas rápidas aparecem em{" "}
        <Link href="/picks" className="font-semibold text-amber-400 underline-offset-2 hover:underline">
          /picks
        </Link>
        .
      </p>
    </article>
  );
}

/** Bloco editorial “Picks em Destaque” — usa as mesmas linhas já carregadas na home. */
export function FeaturedPicksSection({ picks, viewerCanViewPremium }: Props) {
  const slice = picks.slice(0, 6);
  const showPlaceholders = slice.length === 0;

  return (
    <section
      className="relative overflow-hidden border-y border-amber-500/10 bg-gradient-to-b from-[#08080c] via-black to-[#0c0a06] px-4 py-14 sm:py-16"
      aria-labelledby="picks-destaque-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -20%, rgba(245, 158, 11, 0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(59, 130, 246, 0.06), transparent 45%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400/90">
              Linhas rápidas
            </p>
            <h2
              id="picks-destaque-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Picks em <span className="text-gold-gradient">destaque</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Odd, confiança e leitura objetiva — o que está no radar agora, com o mesmo rigor
              BarbosaTips.
            </p>
          </div>
          <Link
            href="/picks"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/[0.07] px-6 py-3 text-sm font-bold text-amber-100 transition duration-300 hover:border-amber-400/55 hover:bg-amber-500/12 hover:shadow-[0_0_32px_-8px_rgba(245,158,11,0.35)]"
          >
            Ver todas as picks
          </Link>
        </div>

        {showPlaceholders ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <PlaceholderCard />
            </li>
            <li className="hidden sm:block">
              <PlaceholderCard />
            </li>
            <li className="hidden lg:block">
              <PlaceholderCard />
            </li>
          </ul>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((pick) => (
              <li key={pick.id}>
                <FeaturedPickCard
                  pick={pick}
                  locked={pick.is_premium && !viewerCanViewPremium}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
