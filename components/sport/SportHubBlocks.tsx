import Link from "next/link";
import { iconeEsporte, rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import type { SportHubStats } from "@/lib/sport-hub-stats";
import type { LeagueEntry } from "@/lib/sport-routes";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "gold" | "green" | "red" | "neutral";
}) {
  const c =
    tone === "green"
      ? "text-emerald-300"
      : tone === "red"
        ? "text-red-300"
        : tone === "gold"
          ? "text-amber-300"
          : "text-white";
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/35 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={cn("mt-1 font-display text-xl font-bold tabular-nums", c)}>{value}</p>
      {sub ? <p className="mt-0.5 text-[10px] text-zinc-600">{sub}</p> : null}
    </div>
  );
}

export function SportStatsStrip({ stats }: { stats: SportHubStats }) {
  const taxa =
    stats.taxaAcertoPct != null ? `${stats.taxaAcertoPct}%` : "—";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <Stat label="Análises" value={stats.analisesCount} tone="gold" />
      <Stat label="Picks" value={stats.totalPicks} sub={`${stats.picksAtivas} ativas`} />
      <Stat label="Greens" value={stats.greens} tone="green" />
      <Stat label="Reds" value={stats.reds} tone="red" />
      <Stat label="Voids" value={stats.voids} tone="neutral" />
      <Stat label="Taxa" value={taxa} sub={`n=${stats.amostraTaxa}`} tone="gold" />
    </div>
  );
}

export function LeagueChips({
  esporteSlug,
  leagues,
}: {
  esporteSlug: string;
  leagues: LeagueEntry[];
}) {
  if (leagues.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {leagues.map((l) => (
        <Link
          key={l.slug}
          href={`/${esporteSlug}/${l.slug}`}
          className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-100 transition hover:border-amber-400/50 hover:bg-amber-500/15"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export function SportHero({
  esporteSlug,
  title,
  subtitle,
  leagues,
}: {
  esporteSlug: string;
  title: string;
  subtitle: string;
  leagues: LeagueEntry[];
}) {
  const icon = iconeEsporte(esporteSlug);
  return (
    <header className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/60 via-black to-zinc-950 p-6 sm:p-10">
      <div
        className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-4xl sm:text-5xl" aria-hidden>
            {icon}
          </p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
            Hub {rotuloEsporte(esporteSlug)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/analises"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-950/60 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-amber-500/35"
          >
            Todas as análises
          </Link>
          <Link
            href="/picks"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-amber-900/25 transition hover:brightness-105"
          >
            Picks rápidas
          </Link>
        </div>
      </div>
      {leagues.length > 0 ? (
        <div className="relative mt-8 border-t border-white/[0.06] pt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Competições
          </p>
          <LeagueChips esporteSlug={esporteSlug} leagues={leagues} />
        </div>
      ) : null}
    </header>
  );
}
