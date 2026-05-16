import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FilePlus,
  MapPin,
  Swords,
  TrendingUp,
  User,
} from "lucide-react";
import { buildEditorialAnalysisHref } from "@/lib/api-football/analysis-link";
import type {
  FootballFixtureEditorialDetail,
  H2HMatch,
  MatchStatistics,
  MatchTrends,
  TeamMatchStats,
  TeamRecentForm,
} from "@/lib/api-football/types";
import { cn } from "@/lib/utils";

function scoreLabel(home: number | null, away: number | null): string {
  if (home == null && away == null) return "—";
  return `${home ?? "—"} – ${away ?? "—"}`;
}

function DetailCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 p-5 shadow-[0_0_40px_-12px_rgba(212,175,55,0.12)] sm:p-6",
        className,
      )}
    >
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "gold" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        variant === "gold" && "bg-gold-500/15 text-gold-200 ring-1 ring-gold-400/25",
        variant === "muted" && "bg-stone-800/80 text-stone-400 ring-1 ring-stone-700/80",
        variant === "default" && "bg-stone-800/60 text-stone-300 ring-1 ring-stone-700/60",
      )}
    >
      {children}
    </span>
  );
}

function TeamLogo({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800/80 text-lg font-bold text-stone-500 ring-1 ring-stone-700">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={64}
      height={64}
      className="h-16 w-16 rounded-2xl bg-stone-900 object-contain p-1 ring-1 ring-gold-400/15"
    />
  );
}

function StatRow({
  label,
  home,
  away,
}: {
  label: string;
  home: string | null;
  away: string | null;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 text-sm">
      <span className="text-right font-medium tabular-nums text-white">{home ?? "—"}</span>
      <span className="text-center text-xs uppercase tracking-wider text-stone-500">{label}</span>
      <span className="font-medium tabular-nums text-white">{away ?? "—"}</span>
    </div>
  );
}

function StatsBlock({ stats }: { stats: MatchStatistics }) {
  const rows: { key: keyof TeamMatchStats; label: string }[] = [
    { key: "possession", label: "Posse" },
    { key: "shots", label: "Chutes" },
    { key: "shotsOnTarget", label: "No gol" },
    { key: "corners", label: "Escanteios" },
    { key: "fouls", label: "Faltas" },
    { key: "yellowCards", label: "Amarelos" },
    { key: "redCards", label: "Vermelhos" },
  ];

  return (
    <div className="divide-y divide-stone-800/80">
      {rows.map(({ key, label }) => (
        <StatRow
          key={key}
          label={label}
          home={stats.home[key]}
          away={stats.away[key]}
        />
      ))}
    </div>
  );
}

function FormBlock({ teamName, form }: { teamName: string; form: TeamRecentForm }) {
  return (
    <div className="rounded-xl border border-stone-800/80 bg-stone-950/50 p-4">
      <p className="font-display text-base font-semibold text-white">{teamName}</p>
      <p className="mt-1 text-xs text-stone-500">
        Últimos {form.sampleSize} jogos finalizados
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="gold">{form.wins}V</Badge>
        <Badge variant="muted">{form.draws}E</Badge>
        <Badge variant="default">{form.losses}D</Badge>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-stone-500">Média marcados</dt>
          <dd className="font-semibold tabular-nums text-gold-200">
            {form.avgGoalsScored.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Média sofridos</dt>
          <dd className="font-semibold tabular-nums text-white">
            {form.avgGoalsConceded.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function TrendsBlock({ trends }: { trends: MatchTrends }) {
  const items = [
    { label: "BTTS", value: `${trends.bttsPct}%` },
    { label: "Over 2.5", value: `${trends.over25Pct}%` },
    { label: "Under 2.5", value: `${trends.under25Pct}%` },
    { label: "Média gols", value: trends.avgTotalGoals.toFixed(2) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gold-400/10 bg-gradient-to-br from-gold-500/8 to-transparent p-4 text-center ring-1 ring-gold-400/10"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            {item.label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-gold-100">{item.value}</p>
        </div>
      ))}
      <p className="col-span-full text-xs text-stone-600">
        Base: {trends.sampleSize} jogos recentes (casa + fora, sem duplicados)
      </p>
    </div>
  );
}

function H2HList({ matches }: { matches: H2HMatch[] }) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-stone-500">Sem confrontos diretos recentes na API.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {matches.map((m) => (
        <li
          key={m.fixtureId}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-800/80 bg-stone-950/40 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-xs text-stone-500">
              {m.kickoffLabel} · {m.leagueName}
            </p>
            <p className="font-medium text-white">
              {m.homeTeam}{" "}
              <span className="text-stone-500">vs</span> {m.awayTeam}
            </p>
          </div>
          <p className="font-display text-lg font-bold tabular-nums text-gold-200">
            {scoreLabel(m.goalsHome, m.goalsAway)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AdminFootballFixtureDetailView({
  detail,
}: {
  detail: FootballFixtureEditorialDetail;
}) {
  const { fixture, statistics, form, trends, h2h } = detail;
  const analysisHref = buildEditorialAnalysisHref(fixture);
  const stadium =
    [fixture.venueName, fixture.venueCity].filter(Boolean).join(" · ") || "A definir";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <Link
        href="/admin/football-api"
        className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar aos jogos
      </Link>

      <header className="relative overflow-hidden rounded-2xl border border-gold-400/15 bg-gradient-to-br from-[#12100c] via-[#0c0b09] to-[#080706] p-6 shadow-[0_0_60px_-16px_rgba(212,175,55,0.2)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold">{fixture.country}</Badge>
            <Badge variant="muted">{fixture.leagueName}</Badge>
            {fixture.round && <Badge>{fixture.round}</Badge>}
            <Badge variant="gold">{fixture.statusLong}</Badge>
          </div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {fixture.homeTeam}{" "}
            <span className="font-normal text-stone-500">vs</span> {fixture.awayTeam}
          </h1>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-400">
            <li className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold-400/80" aria-hidden />
              {stadium}
            </li>
            <li className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold-400/80" aria-hidden />
              {fixture.kickoffLabel}
            </li>
            {fixture.referee && (
              <li className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-gold-400/80" aria-hidden />
                {fixture.referee}
              </li>
            )}
          </ul>
          <p className="font-mono text-xs text-stone-600">Fixture #{fixture.fixtureId}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-gold-400/12 bg-[#0c0b09]/90 p-6 shadow-[0_0_40px_-12px_rgba(212,175,55,0.1)] sm:p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamLogo src={fixture.homeLogo} name={fixture.homeTeam} />
            <p className="font-display text-lg font-semibold text-white sm:text-xl">
              {fixture.homeTeam}
            </p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-bold tabular-nums text-gold-100 sm:text-5xl">
              {scoreLabel(fixture.goalsHome, fixture.goalsAway)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wider text-stone-500">
              {fixture.statusShort}
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamLogo src={fixture.awayLogo} name={fixture.awayTeam} />
            <p className="font-display text-lg font-semibold text-white sm:text-xl">
              {fixture.awayTeam}
            </p>
          </div>
        </div>
      </section>

      <DetailCard title="Estatísticas principais">
        {statistics ? (
          <StatsBlock stats={statistics} />
        ) : (
          <p className="text-sm text-stone-500">
            Estatísticas indisponíveis (jogo ainda não iniciado ou API sem dados).
          </p>
        )}
      </DetailCard>

      <DetailCard title="Forma recente">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormBlock teamName={fixture.homeTeam} form={form.home} />
          <FormBlock teamName={fixture.awayTeam} form={form.away} />
        </div>
      </DetailCard>

      <DetailCard title="Tendências automáticas" className="relative">
        <TrendingUp
          className="absolute right-5 top-5 h-5 w-5 text-gold-400/30"
          aria-hidden
        />
        <TrendsBlock trends={trends} />
      </DetailCard>

      <DetailCard title="Head to head (H2H)">
        <Swords className="mb-3 h-5 w-5 text-gold-400/50" aria-hidden />
        <H2HList matches={h2h} />
      </DetailCard>

      <div className="sticky bottom-4 z-10 flex justify-center sm:bottom-6">
        <Link
          href={analysisHref}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500/25 to-amber-600/15 px-6 py-3.5 text-sm font-semibold text-gold-50 shadow-[0_0_32px_-8px_rgba(212,175,55,0.45)] ring-1 ring-gold-400/35 transition hover:from-gold-500/35 hover:to-amber-600/25"
        >
          <FilePlus className="h-4 w-4" aria-hidden />
          Criar análise editorial
        </Link>
      </div>
    </div>
  );
}
