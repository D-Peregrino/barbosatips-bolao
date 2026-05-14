import Link from "next/link";
import { Lock } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { oddParaNumero } from "@/lib/analises/types";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { PickCard } from "@/components/picks/PickCard";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { siteConfig } from "@/config/site";
import { viewerPodeVerPremium, type PremiumAccess } from "@/lib/premium/types";

type Props = {
  analises: AnaliseRow[];
  picks: QuickPickRow[];
  access: PremiumAccess;
};

function MiniAnalisePremium({
  a,
  unlocked,
}: {
  a: AnaliseRow;
  unlocked: boolean;
}) {
  const oddFmt = oddParaNumero(a.odd).toFixed(2);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#0f0d08] to-black shadow-[0_24px_60px_-28px_rgba(0,0,0,.9)] transition hover:border-amber-400/45">
      <div className="relative">
        <AnaliseCapaMedia analise={a} aspectClass="aspect-[16/10]" />
        <div className="absolute left-3 top-3">
          <PremiumLockBadge />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-base font-bold text-white">
          {a.titulo}
        </h3>
        <p className="text-xs text-zinc-500">
          {a.time_casa} × {a.time_fora}
        </p>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-amber-200/80">
          <span>Odd {oddFmt}</span>
          <span>·</span>
          <span>Conf. {a.confianca}%</span>
        </div>
        {!unlocked ? (
          <p className="line-clamp-2 text-xs text-zinc-500">{a.resumo?.trim() || "…"}</p>
        ) : null}
        <Link
          href={`/analise/${encodeURIComponent(a.slug)}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-900/50"
        >
          {unlocked ? "Ler análise" : (
            <>
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Desbloquear
            </>
          )}
        </Link>
      </div>
    </article>
  );
}

export function PremiumPicksSection({ analises, picks, access }: Props) {
  const unlocked = viewerPodeVerPremium(access);
  const hasContent = analises.length > 0 || picks.length > 0;

  if (!hasContent) return null;

  return (
    <section
      className="relative border-y border-amber-900/35 bg-[#030201] px-4 py-16 sm:py-20"
      aria-labelledby="premium-picks-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(245,158,11,.12),transparent_55%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400/95">
              <Lock className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              BarbosaTips Premium
            </p>
            <h2
              id="premium-picks-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Premium <span className="text-amber-400">Picks</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
              Linhas e análises exclusivas para assinantes — odd, confiança e leitura de mercado
              sem ruído.
            </p>
          </div>
          <Link
            href="/premium"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-amber-900/25 transition hover:brightness-110"
          >
            Tornar-se Premium
          </Link>
        </div>

        {analises.length > 0 ? (
          <div className="mb-10">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-zinc-500">
              Análises premium
            </h3>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {analises.map((a) => (
                <li key={a.id}>
                  <MiniAnalisePremium a={a} unlocked={unlocked} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {picks.length > 0 ? (
          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-zinc-500">
              Picks rápidas premium
            </h3>
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {picks.map((p) => (
                <li key={p.id}>
                  <PickCard pick={p} viewerCanViewPremium={unlocked} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!unlocked ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/20 bg-black/50 px-6 py-8 text-center sm:flex-row sm:text-left">
            <p className="max-w-md text-sm text-zinc-400">
              Já tens conta? Faz login e, quando a tua assinatura estiver ativa, vês tudo aqui e em{" "}
              <Link href="/picks" className="font-semibold text-amber-300 underline-offset-2 hover:underline">
                /picks
              </Link>
              .
            </p>
            <a
              href={siteConfig.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl border border-amber-500/40 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-950/40"
            >
              Telegram VIP
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
