"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildEditorialAnalysisHref } from "@/lib/api-football/analysis-link";
import type { FootballFixtureSummary } from "@/lib/api-football/types";
import { todayDateBrazil } from "@/lib/api-football/dates";

type FixturesPayload = {
  ok: true;
  date: string;
  results: number;
  fixtures: FootballFixtureSummary[];
};

function scoreLabel(home: number | null, away: number | null): string {
  if (home == null && away == null) return "—";
  return `${home ?? "—"} × ${away ?? "—"}`;
}

function FixtureRow({ fixture }: { fixture: FootballFixtureSummary }) {
  const detailHref = `/admin/football-api/${fixture.fixtureId}`;

  return (
    <article className="rounded-xl border border-stone-800/90 bg-stone-950/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-400/90">
            {fixture.country} · {fixture.leagueName}
            {fixture.round ? ` · ${fixture.round}` : ""}
          </p>
          <p className="font-display text-lg font-semibold text-white">
            {fixture.homeTeam}{" "}
            <span className="text-stone-500 font-normal">vs</span> {fixture.awayTeam}
          </p>
          <p className="text-sm text-stone-400">
            {fixture.kickoffLabel} ·{" "}
            <span className="text-stone-300">{fixture.statusLong}</span> (
            {fixture.statusShort})
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold tabular-nums text-white">
            {scoreLabel(fixture.goalsHome, fixture.goalsAway)}
          </p>
          <p className="mt-1 font-mono text-xs text-stone-500">#{fixture.fixtureId}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildEditorialAnalysisHref(fixture)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500/15 px-3 py-2 text-sm font-medium text-gold-300 ring-1 ring-gold-500/30 transition hover:bg-gold-500/25"
        >
          Usar em análise
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </Link>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800/80 px-3 py-2 text-sm font-medium text-stone-200 ring-1 ring-stone-700 transition hover:bg-stone-800 hover:text-white"
        >
          Ver detalhes
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function AdminFootballApiPanel() {
  const [date, setDate] = useState(() => todayDateBrazil());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FixturesPayload | null>(null);

  const load = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/football-api/fixtures?date=${encodeURIComponent(targetDate)}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as FixturesPayload | { ok: false; error: string };

      if (!res.ok || !json.ok) {
        setData(null);
        setError("error" in json ? json.error : "Falha ao carregar jogos");
        return;
      }

      setData(json);
    } catch {
      setData(null);
      setError("Erro de rede ao contactar a API interna.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-stone-800/90 bg-stone-950/50 p-4">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            Data
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
          />
        </label>
        <button
          type="button"
          onClick={() => void load(date)}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50",
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          Atualizar
        </button>
        <button
          type="button"
          onClick={() => setDate(todayDateBrazil())}
          className="rounded-lg px-3 py-2 text-sm text-gold-400 hover:text-gold-300"
        >
          Hoje (BR)
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && data && (
        <p className="flex items-center gap-2 text-sm text-stone-400">
          <Search className="h-4 w-4" aria-hidden />
          {data.results} jogo{data.results === 1 ? "" : "s"} em {data.date}
        </p>
      )}

      {loading && (
        <p className="flex items-center justify-center gap-2 py-16 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          A buscar jogos na API-Football…
        </p>
      )}

      {!loading && data && data.fixtures.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-700 py-12 text-center text-stone-500">
          Nenhum jogo encontrado para esta data.
        </p>
      )}

      {!loading && data && data.fixtures.length > 0 && (
        <ul className="space-y-3">
          {data.fixtures.map((f) => (
            <li key={f.fixtureId}>
              <FixtureRow fixture={f} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-stone-600">
        Painel de consulta — a chave API-Football fica só no servidor. &quot;Ver detalhes&quot;
        abre estatísticas, forma, tendências e H2H. Nenhuma análise é publicada
        automaticamente.
      </p>
    </div>
  );
}
