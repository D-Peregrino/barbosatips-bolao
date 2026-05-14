import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { QuickPickRow } from "@/lib/picks/types";
import { cn } from "@/lib/utils";
import { BrandShield } from "@/components/brand/BrandShield";

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
      className:
        "border-emerald-400/45 bg-emerald-500/12 text-emerald-100 shadow-[0_0_18px_-6px_rgba(52,211,153,0.25)]",
    };
  }
  if (p.resultado === "red") {
    return {
      label: "Red",
      className: "border-rose-400/40 bg-rose-950/40 text-rose-100",
    };
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
        "commercial-card-elevated group relative flex min-h-[168px] flex-col overflow-hidden p-5 transition duration-300 ease-out",
        "hover:-translate-y-1 hover:border-gold-400/30",
        "hover:shadow-[0_24px_56px_-22px_rgba(201,162,39,0.14),inset_0_1px_0_rgba(232,207,122,0.08)]",
        locked && "border-gold-500/22",
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
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
        <span className="rounded-lg border border-gold-400/22 bg-black/45 px-2.5 py-1 font-mono text-xl font-extrabold tabular-nums tracking-tight text-gold-200 shadow-[0_0_20px_-8px_rgba(201,162,39,0.22)]">
          @{odd}
        </span>
      </div>

      <h3 className="relative mt-3 font-display text-base font-bold leading-snug text-cream transition group-hover:text-gold-100 sm:text-lg">
        {pick.jogo}
      </h3>
      <p className="relative mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">
        {pick.mercado}
      </p>

      <div className="relative mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          Conf. {pick.confianca}%
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-300/95 transition group-hover:text-gold-200">
          Ver em picks
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      {locked ? (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center rounded-2xl bg-black/55 backdrop-blur-[2px]">
          <span className="rounded-full border border-gold-400/35 bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-200">
            Premium
          </span>
        </div>
      ) : null}

      <Link
        href="/picks"
        className="absolute inset-0 z-[1] rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={`Abrir picks: ${pick.jogo}`}
      />
    </article>
  );
}

function PlaceholderCard() {
  return (
    <article className="flex min-h-[168px] flex-col items-center justify-center rounded-2xl border border-dashed border-gold-400/22 bg-pitch-950/80 p-5 text-center transition hover:border-gold-400/35 hover:bg-pitch-900/50">
      <BrandShield size="md" className="mb-3 opacity-50" decorative />
      <p className="font-display text-sm font-bold text-cream-muted">Picks em breve</p>
      <p className="mt-2 text-xs text-stone-500">
        Acompanhe o portal — novas linhas rápidas aparecem em{" "}
        <Link href="/picks" className="font-semibold text-gold-300 underline-offset-2 hover:underline">
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
      className="relative overflow-hidden border-y border-gold-400/10 bg-gradient-to-b from-[var(--color-void)] via-black to-pitch-950 px-4 py-16 sm:py-20"
      aria-labelledby="picks-destaque-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -20%, rgba(201, 162, 39, 0.12), transparent 55%), radial-gradient(ellipse 55% 40% at 100% 50%, rgba(212, 175, 55, 0.05), transparent 45%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400/95">
              Linhas rápidas
            </p>
            <h2
              id="picks-destaque-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl"
            >
              Picks em <span className="text-gold-gradient">destaque</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-500">
              Odd, confiança e leitura objetiva — o que está no radar agora, com o mesmo rigor
              BarbosaTips.
            </p>
          </div>
          <Link
            href="/picks"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-gold-400/[0.07] px-6 py-3 text-sm font-bold text-gold-100 transition duration-300 hover:border-gold-300/45 hover:bg-gold-400/12 hover:shadow-[0_0_28px_-8px_rgba(201,162,39,0.28)]"
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
