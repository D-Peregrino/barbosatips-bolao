"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CircleDot,
  Cpu,
  Layers,
  Radar,
  RefreshCw,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildMockSnapshot } from "@/lib/inteligencia/mock-snapshot";
import type { InteligenciaFilterState, InteligenciaSnapshot, SportId } from "@/lib/inteligencia/types";
import {
  ComparatorTable,
  CorrectScoreGrid,
  EvPositiveTable,
  FairOddsTable,
  ProbabilityBlocks,
} from "@/components/inteligencia/InteligenciaTables";
import {
  FormSparkRow,
  HeatmapSvg,
  TrendMultiChart,
  XgBarsChart,
} from "@/components/inteligencia/InteligenciaViz";

const SPORTS: { id: SportId; label: string; abbr: string }[] = [
  { id: "football", label: "Futebol", abbr: "FTB" },
  { id: "tennis", label: "Ténis", abbr: "TEN" },
  { id: "nba", label: "NBA", abbr: "NBA" },
];

const COMPETITIONS: Record<SportId, { id: string; label: string }[]> = {
  football: [
    { id: "all", label: "Todas as ligas" },
    { id: "liga_portugal", label: "Liga Portugal" },
    { id: "liga_inglesa", label: "Premier League (API)" },
    { id: "laliga", label: "LaLiga (API)" },
  ],
  tennis: [
    { id: "all", label: "Todos os torneios" },
    { id: "atp_masters", label: "ATP Masters" },
    { id: "wta_1000", label: "WTA 1000 (API)" },
  ],
  nba: [
    { id: "all", label: "Toda a temporada" },
    { id: "nba_reg", label: "NBA Regular" },
    { id: "nba_playoffs", label: "Playoffs (API)" },
  ],
};

function SectionShell({
  kicker,
  title,
  hint,
  children,
}: {
  kicker: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-950/80 to-black/40 p-4 shadow-[0_0_0_1px_rgba(201,162,39,0.04)] sm:p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500/85">
            {kicker}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
            {title}
          </h2>
          {hint ? <p className="mt-1 max-w-prose text-xs text-zinc-500">{hint}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function useFilteredSnapshot(
  sport: SportId,
  filter: InteligenciaFilterState,
): InteligenciaSnapshot | null {
  return useMemo(() => {
    const snap = buildMockSnapshot(sport);
    const q = filter.query.trim().toLowerCase();
    if (q) {
      const h = snap.fixture.home.toLowerCase();
      const a = snap.fixture.away.toLowerCase();
      if (!h.includes(q) && !a.includes(q)) return null;
    }
    if (filter.competition !== "all" && snap.fixture.competition !== filter.competition) {
      return null;
    }
    return snap;
  }, [sport, filter.query, filter.competition]);
}

export function InteligenciaDashboard() {
  const [sport, setSport] = useState<SportId>("football");
  const [filter, setFilter] = useState<InteligenciaFilterState>({
    competition: "all",
    query: "",
  });
  const [apiHint, setApiHint] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const snapshot = useFilteredSnapshot(sport, filter);

  const pullFromApi = useCallback(async () => {
    setSyncing(true);
    setApiHint(null);
    try {
      const res = await fetch(`/api/inteligencia/snapshot?sport=${sport}`, { cache: "no-store" });
      const src = res.headers.get("X-Barbosa-Intel-Source");
      setApiHint(
        res.ok
          ? `Snapshot API OK · header: ${src ?? "—"} · contrato pronto para feed real.`
          : `API respondeu ${res.status}`,
      );
    } catch {
      setApiHint("Falha de rede ao contactar /api/inteligencia/snapshot.");
    } finally {
      setSyncing(false);
    }
  }, [sport]);

  return (
    <div className="min-h-screen bg-[#020203] pb-24 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(201,162,39,0.07),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(52,211,153,0.05),transparent_45%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <header className="mb-8 flex flex-col gap-6 border-b border-zinc-800/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-gold-400/95">
              <Radar className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">
                Central BT · Inteligência
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
              Inteligência{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-emerald-300">
                esportiva
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Odds justas, EV+, probabilidades, correct score, heatmaps, xG, forma, comparativos e tendências —
              módulos por desporto. Dados de demonstração com o mesmo contrato previsto para APIs e ML.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-500">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-zinc-400">
                <Terminal className="h-3.5 w-3.5" aria-hidden />
                PIPELINE: mock_v1 → api_live → ml_pipeline
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-1">
                <Cpu className="h-3.5 w-3.5 text-emerald-400/90" aria-hidden />
                IA futura: explicação + alertas sobre snapshot validado
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={pullFromApi}
              disabled={syncing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-500/45 disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} aria-hidden />
              Testar API snapshot
            </button>
            <Link
              href="/performance"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-gold-500/35 hover:text-white"
            >
              Performance picks
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          </div>
        </header>

        {apiHint ? (
          <p className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 font-mono text-xs text-zinc-400">
            {apiHint}
          </p>
        ) : null}

        {/* Módulos por desporto */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-1.5">
          {SPORTS.map((s) => {
            const active = sport === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSport(s.id);
                  setFilter((f) => ({ ...f, competition: "all" }));
                }}
                className={cn(
                  "flex min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition sm:flex-none",
                  active
                    ? "bg-gradient-to-r from-gold-500/20 to-emerald-500/15 text-gold-50 ring-1 ring-gold-400/25"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
                )}
              >
                {s.id === "football" ? (
                  <CircleDot className="h-4 w-4 opacity-90" aria-hidden />
                ) : s.id === "tennis" ? (
                  <Activity className="h-4 w-4 opacity-90" aria-hidden />
                ) : (
                  <Layers className="h-4 w-4 opacity-90" aria-hidden />
                )}
                <span>{s.label}</span>
                <span className="font-mono text-[10px] opacity-60">{s.abbr}</span>
              </button>
            );
          })}
        </div>

        {/* Filtros */}
        <div className="mb-8 grid gap-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Competição
            </span>
            <select
              value={filter.competition}
              onChange={(e) => setFilter((f) => ({ ...f, competition: e.target.value }))}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-gold-400/0 transition focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/20"
            >
              {COMPETITIONS[sport].map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Pesquisar equipa / jogador
            </span>
            <input
              value={filter.query}
              onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
              placeholder="ex.: porto, sinner, celtics…"
              className="w-full rounded-xl border border-zinc-800 bg-black/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/20"
            />
          </label>
        </div>

        {!snapshot ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Sem fixture para este filtro</p>
            <p className="mt-3 text-sm text-zinc-400">
              Ajusta a competição ou a pesquisa. Com API real, aqui aparecem jogos do catálogo agregador.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-2xl border border-gold-500/15 bg-gradient-to-r from-zinc-950/90 via-black/50 to-emerald-950/20 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-500/80">
                    Fixture ativa · {snapshot.meta.modelVersion}
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">
                    {snapshot.fixture.home}{" "}
                    <span className="text-zinc-600">vs</span> {snapshot.fixture.away}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{snapshot.fixture.kickoffLabel}</p>
                </div>
                <div className="text-right font-mono text-[10px] leading-relaxed text-zinc-500">
                  <div>source={snapshot.meta.source}</div>
                  <div className="mt-1 max-w-[18rem] text-zinc-600">
                    {snapshot.meta.pipelineNotes.join(" · ")}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              <SectionShell
                kicker="§01 · insights"
                title="Insights automáticos"
                hint="Heurísticas sobre o snapshot — substituir por IA explicativa + regras de risco."
              >
                <ul className="space-y-3">
                  {snapshot.insights.map((i) => (
                    <li
                      key={i.id}
                      className={cn(
                        "rounded-xl border px-3 py-2.5",
                        i.severity === "positive" && "border-emerald-800/50 bg-emerald-950/20",
                        i.severity === "warn" && "border-amber-900/40 bg-amber-950/15",
                        i.severity === "info" && "border-zinc-800 bg-zinc-950/60",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-400/80" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{i.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{i.detail}</p>
                          <p className="mt-2 font-mono text-[10px] text-zinc-600">{i.tags.join(" · ")}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionShell>

              <div className="space-y-4 lg:col-span-2">
                <SectionShell
                  kicker="§02 · odds justas"
                  title="Odds implícitas vs justas"
                  hint="Desvio entre mercado agregado e probabilidade calibrada do modelo."
                >
                  <FairOddsTable rows={snapshot.fairOdds} />
                </SectionShell>

                <SectionShell
                  kicker="§03 · EV+"
                  title="Valor esperado positivo"
                  hint="Comparação P(modelo) vs melhor odd disponível (mock)."
                >
                  <EvPositiveTable rows={snapshot.evPositive} />
                </SectionShell>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionShell
                kicker="§04 · probabilidades"
                title="Blocos de mercado"
                hint="Extensível para props, cantos, cartões, spreads NBA, tie-breaks."
              >
                <ProbabilityBlocks blocks={snapshot.probabilities} />
              </SectionShell>

              <SectionShell
                kicker="§05 · correct score"
                title="Massa de probabilidade · resultado"
                hint="Simulação Monte Carlo futura alimenta esta grelha."
              >
                <CorrectScoreGrid cells={snapshot.correctScores} />
              </SectionShell>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SectionShell
                kicker="§06 · heatmap"
                title={snapshot.heatmap.title}
                hint="Intensidade por zona — tracking provider no roadmap."
              >
                <HeatmapSvg
                  zones={snapshot.heatmap.zones}
                  pitch={snapshot.heatmap.pitchRatio}
                  className="w-full max-h-[220px] rounded-xl border border-zinc-800/80 bg-black/40"
                />
              </SectionShell>

              <SectionShell
                kicker="§07 · xG / pressão"
                title={snapshot.xg.title}
                hint="Para NBA: proxy eFG + FT; para ténis: pressão por game."
              >
                <XgBarsChart splits={snapshot.xg.splits} />
              </SectionShell>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SectionShell
                kicker="§08 · forma"
                title={snapshot.form.title}
                hint="Série temporal normalizada — evita hydration mismatch (só props do mock)."
              >
                <div className="space-y-4">
                  <FormSparkRow label={snapshot.form.sideLeft} points={snapshot.form.left} />
                  <FormSparkRow label={snapshot.form.sideRight} points={snapshot.form.right} />
                </div>
              </SectionShell>

              <SectionShell
                kicker="§09 · comparativo"
                title="Face to face processual"
                hint="Métricas de estilo de jogo / ritmo — expandir com rolling windows."
              >
                <ComparatorTable
                  metrics={snapshot.comparison}
                  leftLabel={snapshot.fixture.home}
                  rightLabel={snapshot.fixture.away}
                />
              </SectionShell>
            </div>

            <div className="mt-6">
              <SectionShell
                kicker="§10 · tendências"
                title="Gráficos avançados · linha do tempo"
                hint="Fecho de linha vs modelo; reservado para bandas de confiança bootstrap."
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <TrendMultiChart series={snapshot.trends} />
                  <ul className="max-w-sm space-y-2 font-mono text-[11px] text-zinc-500">
                    {snapshot.trends.map((s) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <span className="h-2 w-6 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionShell>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
