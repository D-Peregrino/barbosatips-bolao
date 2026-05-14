import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarClock,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Radio,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { OperacionalChecklist } from "@/components/operacional/OperacionalChecklist";
import { loadOperacionalDashboard } from "@/lib/operacional/load-dashboard";
import {
  OPERACIONAL_PERFORMANCE_PLACEHOLDERS,
} from "@/lib/operacional/build-dashboard";
import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";

export const dynamic = "force-dynamic";

const base = siteConfig.url.replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Operacional | ${siteConfig.shortTitle}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${base}/operacional` },
  };
}

const ROTAS_SUGERIDAS = [
  { rota: "/", nota: "Home" },
  { rota: "/analises", nota: "Editorial" },
  { rota: "/picks", nota: "Picks rápidas" },
  { rota: "/comunidade", nota: "Hub comunidade" },
  { rota: "/live", nota: "Live" },
] as const;

function agendaLabel(tipo: string): string {
  if (tipo === "importante") return "Jogos importantes hoje";
  if (tipo === "live") return "Janela ao vivo (heurística)";
  return "Eventos futuros";
}

export default async function OperacionalPage() {
  const data = await loadOperacionalDashboard();
  const { hub } = siteConfig;

  const agendaPorTipo = {
    importante: data.agenda.filter((a) => a.tipo === "importante"),
    live: data.agenda.filter((a) => a.tipo === "live"),
    futuro: data.agenda.filter((a) => a.tipo === "futuro"),
  };

  return (
    <div className="min-h-screen bg-[#030201] pb-20 pt-8 text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(201,162,39,.08),transparent_50%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
        <header className="mb-10 flex flex-col gap-4 border-b border-zinc-800/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-gold-400/90">
              <LayoutDashboard className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Interno</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Painel <span className="text-gold-gradient">operacional</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Resumo diário, agenda a partir das picks, produção editorial e leads. Ambiente confiável
              (sem login nesta rota) — não expor publicamente. Relógio:{" "}
              <span className="font-medium text-zinc-400">{data.refLabel}</span> · America/Sao_Paulo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!(
              siteConfig.betaLaunch.enabled && siteConfig.betaLaunch.hideOperacionalAnalyticsLink
            ) ? (
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-600/35 bg-violet-950/30 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:border-violet-400/45"
              >
                Analytics
                <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </Link>
            ) : null}
            <Link
              href="/admin-picks"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/45"
            >
              Admin picks
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
            <Link
              href="/admin-leads"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-400/45"
            >
              Leads
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
            <Link
              href="/admin-editorial/nova"
              className="inline-flex items-center gap-2 rounded-xl border border-gold-400/25 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-gold-100 transition hover:border-gold-300/45"
            >
              Editorial
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
          </div>
        </header>

        {/* Resumo do dia */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
            <Zap className="h-5 w-5 text-gold-400" aria-hidden />
            Resumo do dia
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { k: "Picks publicadas", v: data.resumo.picksPublicadasHoje },
              { k: "Análises publicadas", v: data.resumo.analisesPublicadasHoje },
              { k: "Greens (jogo hoje)", v: data.resumo.greensHoje },
              { k: "Reds (jogo hoje)", v: data.resumo.redsHoje },
              { k: "Voids (jogo hoje)", v: data.resumo.voidsHoje },
              {
                k: "ROI (u, jogo hoje)",
                v:
                  data.resumo.roiDiarioUnidades === null
                    ? "—"
                    : `${data.resumo.roiDiarioUnidades > 0 ? "+" : ""}${data.resumo.roiDiarioUnidades}u`,
              },
            ].map((c) => (
              <div
                key={c.k}
                className="rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950/95 p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,.85)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{c.k}</p>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums text-white">{c.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            Greens/reds/ROI consideram picks <strong className="text-zinc-500">encerradas</strong> cujo
            horário do jogo cai no dia civil de hoje (Brasília). Picks publicadas usam{" "}
            <span className="text-zinc-500">created_at</span>.
          </p>
        </section>

        <div className="grid gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            {/* Agenda */}
            <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-xl sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
                <CalendarClock className="h-5 w-5 text-sky-400" aria-hidden />
                Agenda
              </h2>
              <div className="space-y-8">
                {(["importante", "live", "futuro"] as const).map((tipo) => {
                  const list =
                    tipo === "importante"
                      ? agendaPorTipo.importante
                      : tipo === "live"
                        ? agendaPorTipo.live
                        : agendaPorTipo.futuro;
                  return (
                    <div key={tipo}>
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        {agendaLabel(tipo)}
                      </p>
                      {list.length === 0 ? (
                        <p className="text-sm text-zinc-600">Sem entradas nesta categoria.</p>
                      ) : (
                        <ul className="space-y-2">
                          {list.map((a) => (
                            <li key={`${tipo}-${a.id}`}>
                              <Link
                                href={a.href}
                                className="flex flex-col gap-0.5 rounded-xl border border-white/6 bg-black/35 px-4 py-3 transition hover:border-gold-400/20 hover:bg-black/50 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="font-semibold text-zinc-100">{a.titulo}</p>
                                  <p className="text-xs text-zinc-500">{a.subtitulo}</p>
                                </div>
                                <div className="mt-2 flex items-center gap-2 sm:mt-0">
                                  {tipo === "live" ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/35 bg-red-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200">
                                      <Radio className="h-3 w-3 animate-pulse" aria-hidden />
                                      Live
                                    </span>
                                  ) : null}
                                  <span className="text-xs tabular-nums text-zinc-500">{a.horarioLabel}</span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Produção */}
            <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-xl sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
                <ClipboardList className="h-5 w-5 text-amber-400" aria-hidden />
                Produção
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/15 p-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Rascunhos</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">
                    {data.producao.analisesRascunho}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">Análises não publicadas</p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Publicadas hoje</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">
                    {data.producao.analisesPublicadasHoje}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">Contagem por created_at</p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-sky-950/15 p-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Picks agendadas</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">
                    {data.producao.picksAtivasFuturas}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">Ativas com horário &gt; agora</p>
                </div>
              </div>
              {data.producao.ultimosRascunhos.length > 0 ? (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Últimos rascunhos
                  </p>
                  <ul className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800/80">
                    {data.producao.ultimosRascunhos.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={r.href}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-gold-200"
                        >
                          <span className="line-clamp-1">{r.titulo}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            {/* Performance */}
            <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-xl sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
                <BarChart3 className="h-5 w-5 text-violet-400" aria-hidden />
                Performance
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {OPERACIONAL_PERFORMANCE_PLACEHOLDERS.map((p) => (
                  <div
                    key={p.label}
                    className="rounded-xl border border-dashed border-zinc-700/80 bg-black/30 p-4"
                  >
                    <p className="text-sm font-bold text-zinc-200">{p.label}</p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600">{p.hint}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Rotas de referência (tráfego manual)
                </p>
                <div className="overflow-hidden rounded-xl border border-zinc-800/80">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-4 py-2">Rota</th>
                        <th className="px-4 py-2">Notas</th>
                        <th className="px-4 py-2 text-right">Acessos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-zinc-400">
                      {ROTAS_SUGERIDAS.map((r) => (
                        <tr key={r.rota} className="bg-zinc-950/30">
                          <td className="px-4 py-2 font-mono text-xs text-gold-200/90">{r.rota}</td>
                          <td className="px-4 py-2 text-xs">{r.nota}</td>
                          <td className="px-4 py-2 text-right text-zinc-600">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  Picks em destaque (por confiança, ativas)
                </p>
                <ul className="space-y-2">
                  {data.picksRecentes.length === 0 ? (
                    <li className="text-sm text-zinc-600">Sem picks ativas.</li>
                  ) : (
                    data.picksRecentes.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/pick/${encodeURIComponent(p.id)}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/30 px-4 py-2.5 text-sm transition hover:border-gold-400/20"
                        >
                          <span className="line-clamp-1 text-zinc-200">{p.jogo}</span>
                          <span className="shrink-0 text-xs font-bold text-amber-300">{p.confianca}%</span>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="mt-6">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <Activity className="h-3.5 w-3.5" aria-hidden />
                  Esportes em alta (48h · picks ativas)
                </p>
                {data.esportesEmAlta.length === 0 ? (
                  <p className="text-sm text-zinc-600">Sem volume nas próximas 48h.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {data.esportesEmAlta.map((e) => (
                      <li
                        key={e.esporte}
                        className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs font-semibold text-zinc-300"
                      >
                        {rotuloEsporte(e.esporte)}{" "}
                        <span className="text-gold-400/90">×{e.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Comunidade */}
            <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-xl">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
                <Users className="h-5 w-5 text-pink-400" aria-hidden />
                Comunidade
              </h2>
              <div className="space-y-4">
                <div className="rounded-xl border border-[#229ED9]/25 bg-[#229ED9]/5 p-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Telegram</p>
                  <p className="mt-1 text-2xl font-bold text-white">—</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Crescimento semanal: registo manual ou API futura.
                  </p>
                  <a
                    href={hub.telegramCanal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-sky-300 hover:underline"
                  >
                    Abrir canal →
                  </a>
                </div>
                <div className="rounded-xl border border-red-500/25 bg-red-950/10 p-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">YouTube</p>
                  <p className="mt-1 text-2xl font-bold text-white">—</p>
                  <p className="mt-1 text-xs text-zinc-600">Inscritos / views: Studio ou planilha.</p>
                  <a
                    href={hub.youtubeCanalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-red-300 hover:underline"
                  >
                    Abrir canal →
                  </a>
                </div>
                <div className="rounded-xl border border-gold-400/20 bg-black/35 p-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Leads capturados</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">{data.leads.total}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Hoje: <span className="font-semibold text-zinc-300">{data.leads.hoje}</span> · Últimos
                    7 dias:{" "}
                    <span className="font-semibold text-zinc-300">{data.leads.ultimos7Dias}</span>
                  </p>
                  <p className="mt-2 text-[10px] text-zinc-600">
                    Amostra até {data.leadsSampleCap} registos mais recentes na query admin.
                  </p>
                  <Link
                    href="/admin-leads"
                    className="mt-2 inline-flex text-xs font-semibold text-gold-300 hover:underline"
                  >
                    Ver lista →
                  </Link>
                </div>
              </div>
            </section>

            {/* Checklist */}
            <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-xl">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
                <Sparkles className="h-5 w-5 text-gold-400" aria-hidden />
                Checklist
              </h2>
              <p className="mb-4 text-xs text-zinc-600">
                Estado guardado neste browser (<span className="font-mono text-zinc-500">localStorage</span>
                ).
              </p>
              <OperacionalChecklist />
            </section>

            {/* Painel rápido */}
            <section className="rounded-2xl border border-gold-400/15 bg-gradient-to-b from-[#14120e] to-zinc-950 p-6 shadow-xl">
              <h2 className="mb-4 font-display text-lg font-bold text-white">Painel rápido</h2>
              <div className="flex flex-col gap-2">
                <Link
                  href="/admin-picks"
                  className="flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600/90 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
                >
                  Criar pick
                </Link>
                <Link
                  href="/admin-editorial/nova"
                  className="flex min-h-[44px] items-center justify-center rounded-xl border border-gold-400/35 bg-black/40 py-3 text-sm font-bold text-gold-100 transition hover:border-gold-300/55"
                >
                  Criar análise
                </Link>
                <Link
                  href="/admin-editorial/nova"
                  className="flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/80 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
                >
                  Criar post (editorial)
                </Link>
                <Link
                  href="/operacional"
                  className="mt-1 text-center text-[11px] text-zinc-600"
                >
                  Atualizar dados: recarregar página
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
