"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Compass,
  LineChart,
  Search,
  Share2,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { ANALYTICS_ENV_KEYS, describeAnalyticsProvider } from "@/config/analytics-providers";
import { AnalyticsBar } from "@/components/analytics/AnalyticsBar";
import type { AnalyticsRangePreset } from "@/lib/analytics/date-range";
import { rangeBoundsMs } from "@/lib/analytics/date-range";
import {
  buildAnalisesHeatProxy,
  buildEsportePerformanceRows,
  buildHorariosPerformance,
  buildLeadsBySource,
  buildLeadsDaily,
  buildMercadosLucrativos,
  buildPicksClickProxy,
  formatSourceLabel,
  maxBarValue,
} from "@/lib/analytics/build-signals";
import type { AnaliseRow } from "@/lib/analises/types";
import type { LeadRow } from "@/lib/leads/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { siteConfig } from "@/config/site";

export type AnalyticsDashboardProps = {
  picks: QuickPickRow[];
  leads: LeadRow[];
  analises: AnaliseRow[];
};

export function AnalyticsDashboard({ picks, leads, analises }: AnalyticsDashboardProps) {
  const [preset, setPreset] = useState<AnalyticsRangePreset>("30d");

  const { fromMs, toMs, label } = useMemo(() => rangeBoundsMs(preset), [preset]);

  const signals = useMemo(() => {
    const porEsporte = buildEsportePerformanceRows(picks, fromMs, toMs);
    const mercados = buildMercadosLucrativos(picks, fromMs, toMs);
    const horas = buildHorariosPerformance(picks, fromMs, toMs);
    const leadsSrc = buildLeadsBySource(leads, fromMs, toMs);
    const leadsDay = buildLeadsDaily(leads, fromMs, toMs);
    const picksProxy = buildPicksClickProxy(picks, fromMs, toMs);
    const analisesProxy = buildAnalisesHeatProxy(analises);
    const maxLeadDay = maxBarValue(leadsDay.map((d) => d.count));
    const maxLucroMercado = maxBarValue(mercados.map((m) => Math.abs(m.lucroU)));
    const maxLucroHora = maxBarValue(horas.map((h) => Math.abs(h.lucroU)));
    const maxLeadSrc = maxBarValue(leadsSrc.map((s) => s.count));
    return {
      porEsporte,
      mercados,
      horas,
      leadsSrc,
      leadsDay,
      picksProxy,
      analisesProxy,
      maxLeadDay,
      maxLucroMercado,
      maxLucroHora,
      maxLeadSrc,
    };
  }, [picks, leads, analises, fromMs, toMs]);

  const { hub } = siteConfig;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 border-b border-zinc-800/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300/90">
            Inteligência · {label}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Filtro aplica-se a picks (timestamp jogo) e leads (created_at). Análises “heat” é proxy
            editorial global.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["7d", "30d", "90d"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPreset(k)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                preset === k
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                  : "border border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-6 shadow-xl sm:p-8">
        <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
          <Share2 className="h-5 w-5 text-fuchsia-400" aria-hidden />
          Conteúdo
        </h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Tempo médio na página", v: "—", n: "GA4 / Plausible engaged time" },
            { t: "CTR (lista picks)", v: "—", n: "Evento pick_impression + pick_open" },
            { t: "Scroll depth médio", v: "—", n: "PostHog ou GA4" },
            { t: "Bounce rate /analises", v: "—", n: "Ligar analytics na rota" },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-white/6 bg-black/35 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{x.t}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">{x.v}</p>
              <p className="mt-1 text-[11px] text-zinc-600">{x.n}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              Análises · heat proxy
            </p>
            <p className="mb-3 text-[11px] text-zinc-600">
              Sem pageviews na BD — ordenação por confiança + recência até existir tracking.
            </p>
            <ul className="divide-y divide-zinc-800/90 rounded-xl border border-zinc-800/80">
              {signals.analisesProxy.length === 0 ? (
                <li className="px-4 py-6 text-sm text-zinc-600">Sem análises publicadas.</li>
              ) : (
                signals.analisesProxy.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={a.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
                    >
                      <span className="line-clamp-2 text-zinc-200">{a.titulo}</span>
                      <span className="shrink-0 text-xs font-bold text-amber-300">{a.confianca}%</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              Picks · proxy de interesse
            </p>
            <p className="mb-3 text-[11px] text-zinc-600">
              Sem cliques na BD — score interno (confiança + recência) no período.
            </p>
            <ul className="divide-y divide-zinc-800/90 rounded-xl border border-zinc-800/80">
              {signals.picksProxy.length === 0 ? (
                <li className="px-4 py-6 text-sm text-zinc-600">Sem picks no período.</li>
              ) : (
                signals.picksProxy.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.href}
                      className="flex flex-col gap-0.5 px-4 py-3 text-sm transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="line-clamp-1 text-zinc-200">{p.jogo}</span>
                      <span className="text-xs text-zinc-500">
                        {p.mercado} · <span className="font-bold text-emerald-300/90">{p.confianca}%</span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-6 shadow-xl sm:p-8">
        <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
          <Users className="h-5 w-5 text-sky-400" aria-hidden />
          Comunidade
        </h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#229ED9]/20 bg-[#229ED9]/5 p-4">
            <p className="text-[10px] font-bold uppercase text-zinc-500">Telegram</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">—</p>
            <p className="mt-1 text-[11px] text-zinc-600">Membros / reach via Bot API ou export manual.</p>
            <a
              href={hub.telegramCanal}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-sky-300 hover:underline"
            >
              Abrir canal
            </a>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4">
            <p className="text-[10px] font-bold uppercase text-zinc-500">YouTube</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">—</p>
            <p className="mt-1 text-[11px] text-zinc-600">Subs e views no YouTube Studio.</p>
            <a
              href={hub.youtubeCanalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-red-300 hover:underline"
            >
              Abrir canal
            </a>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase text-zinc-500">Leads (Supabase)</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {signals.leadsSrc.reduce((s, x) => s + x.count, 0)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">Novos no período filtrado (amostra admin).</p>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Origem (leads)</p>
            <div className="space-y-3">
              {signals.leadsSrc.length === 0 ? (
                <p className="text-sm text-zinc-600">Sem leads no período.</p>
              ) : (
                signals.leadsSrc.map((s) => (
                  <AnalyticsBar
                    key={s.source}
                    label={formatSourceLabel(s.source)}
                    value={s.count}
                    max={signals.maxLeadSrc}
                  />
                ))
              )}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Leads por dia</p>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {signals.leadsDay.length === 0 ? (
                <p className="text-sm text-zinc-600">Sem pontos no período.</p>
              ) : (
                signals.leadsDay.map((d) => (
                  <AnalyticsBar key={d.key} label={d.label} value={d.count} max={signals.maxLeadDay} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-6 shadow-xl sm:p-8">
        <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
          <Activity className="h-5 w-5 text-emerald-400" aria-hidden />
          Performance (picks encerradas no período)
        </h2>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Por desporto</p>
            <div className="overflow-hidden rounded-xl border border-zinc-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-[10px] font-bold uppercase text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Desporto</th>
                    <th className="px-3 py-2 text-right">ROI%</th>
                    <th className="px-3 py-2 text-right">Taxa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  {signals.porEsporte.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-zinc-600">
                        Sem dados encerrados no período.
                      </td>
                    </tr>
                  ) : (
                    signals.porEsporte.map((r) => (
                      <tr key={r.key} className="hover:bg-white/5">
                        <td className="px-3 py-2">
                          <span className="mr-1">{r.icon}</span>
                          {r.label}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-emerald-300/90">
                          {r.roiPct === null ? "—" : `${r.roiPct}%`}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {r.taxaPct === null ? "—" : `${r.taxaPct}%`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
              Mercados mais lucrativos (u)
            </p>
            <div className="space-y-2">
              {signals.mercados.length === 0 ? (
                <p className="text-sm text-zinc-600">Sem mercados com green/red no período.</p>
              ) : (
                signals.mercados.map((m) => (
                  <AnalyticsBar
                    key={m.mercado}
                    label={m.mercado.length > 42 ? `${m.mercado.slice(0, 40)}…` : m.mercado}
                    value={m.lucroU}
                    max={signals.maxLucroMercado}
                    variant="signed"
                  />
                ))
              )}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
              Horário (Brasília) · |lucro|
            </p>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
              {signals.horas.map((h) => {
                const hite =
                  signals.maxLucroHora > 0 ? (Math.abs(h.lucroU) / signals.maxLucroHora) * 100 : 0;
                return (
                  <div key={h.hora} className="flex flex-col items-center gap-1">
                    <div className="flex h-20 w-full items-end justify-center rounded-md bg-zinc-900/80 px-0.5 pt-1">
                      <div
                        className={`w-full max-w-[14px] rounded-t ${
                          h.lucroU < 0
                            ? "bg-gradient-to-t from-rose-700 to-red-500"
                            : "bg-gradient-to-t from-violet-700 to-fuchsia-400"
                        }`}
                        style={{ height: `${Math.max(8, hite)}%` }}
                        title={`${h.label}: ${h.lucroU}u · ${h.apostas} ap.`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-600">{h.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-6 shadow-xl sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
          <Target className="h-5 w-5 text-amber-400" aria-hidden />
          Conversão
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "CTA mais clicados", d: "Eventos `cta_click` com data-attributes." },
            { t: "Páginas mais fortes", d: "Funil land → scroll → CTA → lead (PostHog)." },
            { t: "Retenção", d: "Cohort newsletter / WAU — pendente." },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-dashed border-zinc-700/80 bg-black/30 p-4">
              <p className="text-sm font-bold text-zinc-200">{x.t}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">{x.d}</p>
              <p className="mt-3 font-display text-xl text-zinc-700">—</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-6 shadow-xl sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
          <Search className="h-5 w-5 text-cyan-400" aria-hidden />
          SEO (painel interno)
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["Páginas indexadas", "Search Console → Cobertura."],
            ["Crescimento orgânico", "Impressões e cliques exportados ou API."],
            ["Top páginas orgânicas", "Queries com maior CTR no GSC."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-cyan-500/15 bg-cyan-950/10 p-4">
              <p className="text-xs font-bold uppercase text-zinc-500">{t}</p>
              <p className="mt-2 font-display text-2xl text-zinc-700">—</p>
              <p className="mt-2 text-xs text-zinc-600">{d}</p>
            </div>
          ))}
        </div>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:underline"
        >
          Abrir Search Console
          <LineChart className="h-4 w-4" aria-hidden />
        </a>
      </section>

      <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-zinc-950 p-6 shadow-xl sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
          <Compass className="h-5 w-5 text-violet-300" aria-hidden />
          Preparar integrações
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(ANALYTICS_ENV_KEYS) as (keyof typeof ANALYTICS_ENV_KEYS)[]).map((id) => (
            <div key={id} className="rounded-xl border border-white/8 bg-black/35 p-4">
              <p className="text-sm font-bold capitalize text-zinc-200">{id}</p>
              <p className="mt-1 text-xs text-zinc-500">{describeAnalyticsProvider(id)}</p>
              <ul className="mt-2 space-y-1 font-mono text-[10px] text-zinc-600">
                {ANALYTICS_ENV_KEYS[id].map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-6 text-xs text-zinc-600">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-400/80" aria-hidden />
          Picks/leads: Supabase · Web/SEO: instrumentar com as chaves acima.
        </span>
        <Link href="/operacional" className="font-semibold text-violet-300 hover:underline">
          Operacional →
        </Link>
      </footer>
    </div>
  );
}
