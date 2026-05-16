"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Loader2, RefreshCw, Search } from "lucide-react";
import { todayDateBrazil } from "@/lib/api-football/dates";
import type { FootballFixtureSummary } from "@/lib/api-football/types";
import { cn } from "@/lib/utils";

type FixturesPayload = {
  ok: true;
  date: string;
  results: number;
  fixtures: FootballFixtureSummary[];
};

function scoreLabel(home: number | null, away: number | null): string {
  if (home == null && away == null) return "-";
  return `${home ?? "-"} x ${away ?? "-"}`;
}

export function VipFootballInsightsPanel() {
  const [date, setDate] = useState(() => todayDateBrazil());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FixturesPayload | null>(null);

  const load = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vip/football-insights?date=${encodeURIComponent(targetDate)}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as FixturesPayload | { ok: false; error: string };
      if (!res.ok || !json.ok) {
        setData(null);
        setError("error" in json ? json.error : "Falha ao carregar insights.");
        return;
      }
      setData(json);
    } catch {
      setData(null);
      setError("Erro de rede ao carregar insights.");
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
          Atualizar
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {!loading && data ? (
        <p className="flex items-center gap-2 text-sm text-stone-400">
          <Search className="h-4 w-4" aria-hidden />
          {data.results} jogo{data.results === 1 ? "" : "s"} em {data.date}
        </p>
      ) : null}

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-16 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Carregando insights...
        </p>
      ) : null}

      {!loading && data && data.fixtures.length > 0 ? (
        <ul className="space-y-3">
          {data.fixtures.map((fixture) => (
            <li key={fixture.fixtureId} className="rounded-xl border border-stone-800/90 bg-stone-950/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-400/90">
                    {fixture.country} · {fixture.leagueName}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold text-white">
                    {fixture.homeTeam} <span className="font-normal text-stone-500">vs</span>{" "}
                    {fixture.awayTeam}
                  </h2>
                  <p className="mt-1 text-sm text-stone-400">
                    {fixture.kickoffLabel} · {fixture.statusLong}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold tabular-nums text-white">
                    {scoreLabel(fixture.goalsHome, fixture.goalsAway)}
                  </p>
                  <p className="mt-1 text-xs text-stone-600">Insight #{fixture.fixtureId}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
