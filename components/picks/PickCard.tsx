import type { ReactNode } from "react";
import Link from "next/link";
import type { QuickPickRow } from "@/lib/picks/types";
import { cn } from "@/lib/utils";
import { iconeEsporte, rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";

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
  if (n >= 80) return "from-amber-500/90 to-orange-600 text-pitch-950";
  if (n >= 60) return "from-emerald-500/85 to-emerald-700 text-white";
  return "from-zinc-500 to-zinc-700 text-white";
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
      className: "border-emerald-400/50 bg-emerald-500/25 text-emerald-100",
    };
  }
  if (pick.resultado === "red") {
    return {
      label: "RED",
      className: "border-red-400/50 bg-red-500/25 text-red-100",
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

function cardShellClass(pick: QuickPickRow, premiumLocked: boolean): string {
  if (premiumLocked) {
    return cn(
      "border-amber-600/35 bg-gradient-to-br from-[#0f0c06] to-black",
      "ring-1 ring-amber-500/15",
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
      "border-emerald-500/50 bg-gradient-to-br from-emerald-950/45 to-pitch-950",
      "ring-1 ring-emerald-500/20",
    );
  }
  if (pick.resultado === "red") {
    return cn(
      "border-red-500/50 bg-gradient-to-br from-red-950/40 to-pitch-950",
      "ring-1 ring-red-500/18",
    );
  }
  if (pick.resultado === "void") {
    return cn(
      "border-zinc-600/55 bg-gradient-to-br from-zinc-900/70 to-pitch-950",
      "ring-1 ring-zinc-600/20",
    );
  }
  return "border-[#3d3420]/80 bg-gradient-to-br from-[#12100e] to-[#080706]";
}

function cantoIcone(pick: QuickPickRow, premiumLocked: boolean): ReactNode {
  if (premiumLocked) {
    return (
      <div className="absolute right-3 top-3" aria-hidden>
        <PremiumLockBadge className="scale-95 shadow-md" />
      </div>
    );
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
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-pitch-950 shadow-lg"
        aria-label="Green"
      >
        ✓
      </div>
    );
  }
  if (pick.resultado === "red") {
    return (
      <div
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-lg font-black text-white shadow-lg"
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

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,.75)] transition duration-300 hover:-translate-y-0.5",
        cardShellClass(pick, locked),
      )}
    >
      {cantoIcone(pick, locked)}

      <div className="mb-3 flex flex-wrap items-center gap-2 pr-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
          <span aria-hidden>{icon}</span>
          {sportLabel}
        </span>
        {pick.is_premium && !locked ? (
          <PremiumLockBadge className="scale-90" />
        ) : null}
        {pick.campeonato?.trim() ? (
          <span className="rounded-full border border-gold/25 bg-gold/5 px-2.5 py-0.5 text-[11px] font-medium text-gold/90">
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

      <h2 className="font-display text-xl font-bold leading-snug text-white sm:text-2xl">
        {pick.jogo}
      </h2>

      {locked ? (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-amber-500/20 bg-black/40 py-8">
          <div
            className="pointer-events-none space-y-3 px-2 blur-md"
            aria-hidden
          >
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-zinc-400">Mercado</span>
              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-sm text-zinc-100">
                {pick.mercado}
              </span>
              <span className="ml-auto font-mono text-lg text-gold">
                @{pick.odd.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-zinc-400">{pick.justificativa}</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-black via-black/80 to-transparent px-4 text-center">
            <PremiumLockBadge />
            <Link
              href="/premium"
              className="mt-1 text-xs font-bold uppercase tracking-wide text-amber-300 underline-offset-2 hover:underline"
            >
              Desbloquear Premium
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-medium text-zinc-400">Mercado</span>
            <span className="rounded-lg bg-white/5 px-2 py-0.5 text-sm font-semibold text-zinc-100">
              {pick.mercado}
            </span>
            <span className="ml-auto font-mono text-lg font-bold tabular-nums text-gold">
              @{pick.odd.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
            {pick.justificativa?.trim() || "Pick rápida — sem justificativa longa."}
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div className="text-xs text-zinc-500">
          <span className="block uppercase tracking-wider text-zinc-600">Jogo</span>
          <time dateTime={pick.horario_jogo} className="font-medium text-zinc-300">
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
    </article>
  );
}
