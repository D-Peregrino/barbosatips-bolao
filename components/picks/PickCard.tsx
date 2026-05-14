import type { ReactNode } from "react";
import Link from "next/link";
import type { QuickPickRow } from "@/lib/picks/types";
import { cn } from "@/lib/utils";
import { iconeEsporte, rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import { pickContentTier } from "@/lib/premium/content-tier";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { PremiumPickLockCorner } from "@/components/premium/PremiumPickLockCorner";
import { VipBadge } from "@/components/premium/VipBadge";
import { FavoriteHeartButton } from "@/components/engagement/FavoriteHeartButton";
import {
  betaPremiumHref,
  betaPremiumUpsellLabel,
  betaVipHref,
  betaVipUpsellLabel,
} from "@/lib/beta/cta-hrefs";

function formatarHorario(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function corConfianca(n: number): string {
  if (n >= 80) return "from-gold-400/95 to-gold-600 text-pitch-950";
  if (n >= 60) return "from-emerald-400/95 to-emerald-700 text-pitch-950";
  return "from-stone-600 to-stone-800 text-cream";
}

function badgeResultado(
  pick: QuickPickRow,
): { label: string; className: string } | null {
  if (pick.status === "ativo") {
    return {
      label: "AO VIVO",
      className:
        "border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-[0_0_20px_-4px_rgba(251,191,36,.35)]",
    };
  }
  if (pick.resultado === "green") {
    return {
      label: "GREEN",
      className:
        "border-emerald-400/45 bg-emerald-500/12 text-emerald-100 shadow-[0_0_20px_-6px_rgba(52,211,153,0.35)]",
    };
  }
  if (pick.resultado === "red") {
    return {
      label: "RED",
      className:
        "border-rose-400/40 bg-rose-950/45 text-rose-100 shadow-[0_0_18px_-6px_rgba(251,113,133,0.22)]",
    };
  }
  if (pick.resultado === "void") {
    return {
      label: "VOID",
      className: "border-zinc-500/60 bg-zinc-700/40 text-zinc-200",
    };
  }
  if (pick.resultado === "pendente") {
    return {
      label: "PENDENTE",
      className: "border-amber-400/45 bg-amber-950/50 text-amber-100",
    };
  }
  return null;
}

function cardShellClass(
  pick: QuickPickRow,
  premiumLocked: boolean,
  tier: ReturnType<typeof pickContentTier>,
): string {
  if (premiumLocked) {
    return cn(
      "border-amber-600/35 bg-gradient-to-br from-[#0f0c06] to-black",
      "ring-1 ring-amber-500/15",
      tier === "exclusive" && "ring-gold-400/22 border-gold-500/25",
    );
  }
  if (pick.status === "ativo") {
    return cn(
      "border-amber-500/45 bg-gradient-to-br from-amber-950/35 to-[#080706]",
      "ring-1 ring-amber-500/15",
    );
  }
  if (pick.status === "encerrado" && pick.resultado === "pendente") {
    return cn(
      "border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-pitch-950",
      "ring-1 ring-amber-500/12",
    );
  }
  if (pick.resultado === "green") {
    return cn(
      "border-emerald-400/45 bg-gradient-to-br from-emerald-950/55 via-pitch-950 to-[var(--color-void)]",
      "ring-1 ring-emerald-400/18",
    );
  }
  if (pick.resultado === "red") {
    return cn(
      "border-rose-500/40 bg-gradient-to-br from-rose-950/50 via-pitch-950 to-[var(--color-void)]",
      "ring-1 ring-rose-400/15",
    );
  }
  if (pick.resultado === "void") {
    return cn(
      "border-zinc-600/55 bg-gradient-to-br from-zinc-900/70 to-pitch-950",
      "ring-1 ring-zinc-600/20",
    );
  }
  return "border-gold-400/16 bg-gradient-to-br from-pitch-900/95 to-[var(--color-void)] ring-1 ring-gold-400/8";
}

function cantoIcone(
  pick: QuickPickRow,
  premiumLocked: boolean,
  tier: ReturnType<typeof pickContentTier>,
): ReactNode {
  if (premiumLocked) {
    return <PremiumPickLockCorner tier={tier} />;
  }
  if (pick.status === "ativo") {
    return (
      <div
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/90 text-sm font-black text-pitch-950 shadow-lg"
        aria-hidden
      >
        ●
      </div>
    );
  }
  if (pick.resultado === "green") {
    return (
      <div
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-400 text-lg font-black text-pitch-950 shadow-[0_0_20px_-4px_rgba(52,211,153,0.5)]"
        aria-label="Green"
      >
        ✓
      </div>
    );
  }
  if (pick.resultado === "red") {
    return (
      <div
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/40 bg-rose-600 text-lg font-black text-cream shadow-[0_0_18px_-4px_rgba(251,113,133,0.35)]"
        aria-label="Red"
      >
        ✕
      </div>
    );
  }
  if (pick.resultado === "void") {
    return (
      <div
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-500 bg-zinc-800 text-xs font-black text-zinc-200 shadow-lg"
        aria-label="Void"
      >
        ∅
      </div>
    );
  }
  if (pick.resultado === "pendente" && pick.status === "encerrado") {
    return (
      <div
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/50 bg-amber-950/80 text-xs font-black text-amber-200 shadow-lg"
        aria-label="Pendente"
      >
        ?
      </div>
    );
  }
  return null;
}

type PickCardProps = {
  pick: QuickPickRow;
  /** Por omissão true (admin / assinante). */
  viewerCanViewPremium?: boolean;
};

export function PickCard({ pick, viewerCanViewPremium = true }: PickCardProps) {
  const sportLabel = rotuloEsporte(pick.esporte);
  const icon = iconeEsporte(pick.esporte);
  const badge = badgeResultado(pick);
  const locked = pick.is_premium && !viewerCanViewPremium;
  const tier = pickContentTier(pick);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border p-4 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.75)] transition duration-300 sm:rounded-2xl sm:p-5 sm:shadow-[0_24px_56px_-30px_rgba(0,0,0,.82)] md:hover:-translate-y-0.5 md:hover:shadow-[0_28px_60px_-26px_rgba(201,162,39,0.12)]",
        cardShellClass(pick, locked, tier),
      )}
    >
      <Link
        href={`/pick/${encodeURIComponent(pick.id)}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950 sm:rounded-2xl"
        aria-label={`Ver pick ${pick.jogo}`}
      />

      <div className="absolute left-3 top-3 z-30">
        <FavoriteHeartButton kind="pick" refId={pick.id} />
      </div>

      <div className="relative z-10 pointer-events-none">
        {cantoIcone(pick, locked, tier)}

        <div className="mb-3 flex flex-wrap items-center gap-2 pr-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-600/70 bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
            <span aria-hidden>{icon}</span>
            {sportLabel}
          </span>
          {pick.is_premium && !locked ? (
            <>
              {tier === "exclusive" ? <VipBadge compact className="scale-95" /> : null}
              <PremiumLockBadge className="scale-90" />
            </>
          ) : null}
          {pick.campeonato?.trim() ? (
            <span className="rounded-full border border-gold-400/22 bg-gold-400/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-gold-200/95">
              {pick.campeonato.trim()}
            </span>
          ) : null}
          {badge && !locked ? (
            <span
              className={cn(
                "ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          ) : null}
        </div>

        <h2 className="font-display text-lg font-bold leading-snug text-cream sm:text-xl md:text-2xl">{pick.jogo}</h2>

        {locked ? (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-gold-400/18 bg-black/50 py-8">
            <div className="space-y-3 px-2 blur-md" aria-hidden>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-zinc-400">Mercado</span>
                <span className="rounded-lg bg-white/5 px-2 py-0.5 text-sm text-zinc-100">{pick.mercado}</span>
                <span className="ml-auto rounded-lg border border-gold-400/28 bg-gradient-to-br from-gold-400/[0.08] to-black/55 px-2.5 py-1 font-mono text-lg font-extrabold tabular-nums tracking-tight text-gold-100 shadow-[0_0_20px_-10px_rgba(201,162,39,0.35)] sm:text-xl">
                  @{pick.odd.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{pick.justificativa}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-baseline gap-2 gap-y-2">
              <span className="text-sm font-medium text-stone-400">Mercado</span>
              <span className="rounded-lg border border-gold-400/10 bg-white/[0.03] px-2 py-0.5 text-sm font-semibold text-cream-muted">
                {pick.mercado}
              </span>
              <span className="ml-auto rounded-lg border border-gold-400/28 bg-gradient-to-br from-gold-400/[0.08] to-black/55 px-2.5 py-1 font-mono text-lg font-extrabold tabular-nums tracking-tight text-gold-100 shadow-[0_0_20px_-10px_rgba(201,162,39,0.35)] sm:text-xl">
                @{pick.odd.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-400">
              {pick.justificativa?.trim() || "Pick rápida — sem justificativa longa."}
            </p>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gold-400/12 pt-4">
          <div className="text-xs text-stone-400">
            <span className="block uppercase tracking-wider text-stone-500">Jogo</span>
            <time dateTime={pick.horario_jogo} className="font-medium text-cream-muted">
              {formatarHorario(pick.horario_jogo)}
            </time>
          </div>
          <div
            className={cn(
              "rounded-lg bg-gradient-to-r px-3 py-1.5 text-xs font-black uppercase tracking-wide shadow-md",
              locked ? "blur-sm opacity-60" : corConfianca(pick.confianca),
            )}
          >
            Confiança {pick.confianca}%
          </div>
        </div>
      </div>

      {locked ? (
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-black via-black/85 to-black/40 px-4 text-center">
          {tier === "exclusive" ? <VipBadge className="mb-1" /> : null}
          <PremiumLockBadge />
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-wide">
            <Link href={betaVipHref()} className="text-gold-200 underline-offset-2 hover:underline">
              {betaVipUpsellLabel()}
            </Link>
            <span className="text-zinc-600" aria-hidden>
              ·
            </span>
            <Link href={betaPremiumHref()} className="text-amber-300 underline-offset-2 hover:underline">
              {betaPremiumUpsellLabel()}
            </Link>
          </div>
        </div>
      ) : null}
    </article>
  );
}
