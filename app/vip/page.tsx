import type { Metadata } from "next";
import Link from "next/link";
import { Crown, LineChart, Shield, Sparkles, Target, Trophy } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { listarQuickPicksPerformance } from "@/lib/picks/queries";
import { computePerformanceModel } from "@/lib/picks/performance-compute";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `VIP · ${siteConfig.shortTitle}`,
    description:
      "Barbosa VIP Premium — assinatura que libera Picks Premium, Central EV+ e Football API Insights.",
    path: "/vip",
    keywords: buildKeywordsFromParts(["VIP", "assinatura", "prognósticos", "ROI"]),
  });
}

const beneficios = [
  {
    icon: Sparkles,
    titulo: "Picks Premium",
    texto: "Acesso completo às picks em /picks. Visitantes veem apenas teaser e CTA.",
  },
  {
    icon: Target,
    titulo: "Central EV+",
    texto: "Acesso à versão VIP da Central EV+ em /vip/central-ev, sem ações administrativas.",
  },
  {
    icon: Shield,
    titulo: "Football API Insights",
    texto: "Consulta VIP em /vip/football-insights, sem chaves ou botões internos.",
  },
];

const vantagens = [
  "VIP Premium é uma assinatura recorrente.",
  "Bolão é produto separado e não libera VIP automaticamente.",
  "Lojinha tem produtos avulsos fora do VIP.",
  "Usuários VIP não acessam /admin.",
];

export default async function VipPage() {
  const picks = await listarQuickPicksPerformance();
  const model = computePerformanceModel(picks);
  const ultimos = model.ultimosResultados.slice(0, 6);

  const roiTxt =
    model.roiEstimadoPct != null ? `${model.roiEstimadoPct.toFixed(1)}%` : "—";
  const taxaTxt =
    model.taxaAcertoPct != null ? `${model.taxaAcertoPct.toFixed(1)}%` : "—";

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-95"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% -12%, rgba(201, 162, 39, 0.16), transparent 52%), radial-gradient(ellipse 45% 40% at 100% 20%, rgba(52, 211, 153, 0.05), transparent 48%)",
        }}
        aria-hidden
      />

      <CommercialPageShell>
        <header className="relative mb-14 max-w-4xl overflow-hidden rounded-3xl border border-gold-400/22 bg-gradient-to-br from-zinc-900/60 via-black/95 to-zinc-950 p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl"
            aria-hidden
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-black/50 px-3 py-1 font-display text-[10px] font-black uppercase tracking-[0.22em] text-gold-200">
            <Crown className="h-3.5 w-3.5 text-gold-300" strokeWidth={2.2} aria-hidden />
            Programa VIP
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            BarbosaTips <span className="text-gold-gradient">VIP</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Assinatura recorrente que libera Picks Premium, Central EV+ e Football API
            Insights. Admin, Bolão e Lojinha continuam separados.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/vip/checkout"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-gold-600 via-gold-500 to-amber-600 px-8 py-3.5 text-sm font-bold text-pitch-950 shadow-[0_16px_48px_-12px_rgba(201,162,39,0.45)] transition hover:brightness-110"
            >
              Assinar VIP Premium
            </Link>
            <Link
              href="/vip/central-ev"
              className="inline-flex items-center justify-center rounded-2xl border border-gold-400/35 bg-black/50 px-6 py-3.5 text-sm font-bold text-gold-100 transition hover:border-gold-300/50 hover:bg-gold-400/10"
            >
              Ver Central EV+
            </Link>
          </div>
        </header>

        <section className="mb-14 grid gap-4 sm:grid-cols-3">
          <StatCard label="ROI estimado (1u)" value={roiTxt} hint="Janela pública quick picks." />
          <StatCard label="Taxa acerto" value={taxaTxt} hint="Sobre greens + reds encerrados." />
          <StatCard
            label="Amostra encerradas"
            value={String(model.encerradas)}
            hint={`${model.greens} G · ${model.reds} R · voids ${model.voids}`}
          />
        </section>

        <section className="mb-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Benefícios</h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-500">
                Uma assinatura, três áreas liberadas, sem misturar com Admin, Bolão ou Lojinha.
              </p>
            </div>
            <LineChart className="h-8 w-8 text-gold-400/50" strokeWidth={1.5} aria-hidden />
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {beneficios.map(({ icon: Icon, titulo, texto }) => (
              <li
                key={titulo}
                className="commercial-card-elevated border border-gold-400/12 p-6 transition hover:border-gold-400/28"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/[0.07] text-gold-200">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14 grid gap-10 lg:grid-cols-2">
          <div className="commercial-card-elevated border p-6 sm:p-8">
            <div className="flex items-center gap-2 text-gold-400/95">
              <Trophy className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              <h2 className="font-display text-xl font-bold text-white">Resultados recentes</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Pré-visualização pública — espelha a secção de performance.
            </p>
            <ul className="mt-6 space-y-3">
              {ultimos.length === 0 ? (
                <li className="text-sm text-zinc-500">Sem dados suficientes ainda.</li>
              ) : (
                ultimos.map((u) => (
                  <li
                    key={u.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/6 bg-black/40 px-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-zinc-200">{u.jogo}</span>
                    <span className="font-mono text-xs text-gold-200/90">@{u.odd.toFixed(2)}</span>
                    <span
                      className={
                        u.resultado === "green"
                          ? "text-emerald-400"
                          : u.resultado === "red"
                            ? "text-rose-400"
                            : "text-zinc-500"
                      }
                    >
                      {u.resultado.toUpperCase()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="commercial-card-elevated border p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">Vantagens operacionais</h2>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              {vantagens.map((v) => (
                <li key={v} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400/80" aria-hidden />
                  {v}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-gold-400/20 bg-gradient-to-br from-gold-400/[0.06] to-transparent p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300/90">CTA</p>
              <p className="mt-2 text-sm text-zinc-400">
                Checkout recorrente será conectado depois. Por enquanto, o botão de assinatura
                permanece temporário.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/vip/football-insights"
                  className="rounded-xl border border-gold-400/35 bg-black/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-gold-100 transition hover:bg-gold-400/10"
                >
                  Football Insights
                </Link>
                <a
                  href={siteConfig.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#229ED9] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </section>
      </CommercialPageShell>
    </div>
  );
}

function StatCard(props: { label: string; value: string; hint: string }) {
  return (
    <div className="commercial-card-elevated border border-white/8 p-5 text-center sm:text-left">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{props.label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">{props.value}</p>
      <p className="mt-1 text-xs text-zinc-600">{props.hint}</p>
    </div>
  );
}
