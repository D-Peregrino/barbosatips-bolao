import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Lock, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { betaVipHubCtaLabel, betaVipPageHref } from "@/lib/beta/cta-hrefs";
import { PLACEHOLDER_PLANS } from "@/lib/billing/billing-roadmap";

const base = siteConfig.url.replace(/\/$/, "");

export const metadata: Metadata = {
  title: `Premium | ${siteConfig.shortTitle}`,
  description:
    "BarbosaTips Premium — camadas público, premium e conteúdo exclusivo, pré-visualizações e planos futuros (Mercado Pago / Stripe).",
  alternates: { canonical: `${base}/premium` },
  robots: { index: true, follow: true },
};

const beneficios = [
  {
    icon: Sparkles,
    titulo: "Conteúdo completo",
    texto: "Análises longas e picks rápidas desbloqueados para assinantes — leitura integral no portal.",
  },
  {
    icon: Zap,
    titulo: "Antecipação",
    texto: "Linhas de valor e mercados seleccionados com contexto e confiança explícitos.",
  },
  {
    icon: Shield,
    titulo: "Disciplina visual",
    texto: "Experiência premium esportiva: elegante, escura e sofisticada — sem estética de cassino.",
  },
];

export default function PremiumPage() {
  const tg = siteConfig.social.telegram;

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-95"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(217, 119, 6, 0.14), transparent 50%)",
        }}
        aria-hidden
      />

      <CommercialPageShell>
        <header className="mb-14 max-w-4xl text-center">
          <p className="inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            <Lock className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            Premium
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            BarbosaTips <span className="text-gold-gradient">Premium</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Três camadas editoriais: <strong className="text-zinc-200">público</strong>,{" "}
            <strong className="text-zinc-200">premium</strong> (reservado) e{" "}
            <strong className="text-zinc-200">conteúdo exclusivo</strong> para quem apoia o projeto.
            Pagamentos recorrentes serão ligados aqui — ainda sem cobrança automática.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={betaVipPageHref()}
              className="inline-flex items-center gap-2 rounded-2xl border border-gold-400/40 bg-gold-400/[0.08] px-6 py-3 text-sm font-bold text-gold-100 transition hover:border-gold-300/55 hover:bg-gold-400/12"
            >
              <Crown className="h-4 w-4 text-gold-300" aria-hidden />
              {betaVipHubCtaLabel()}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-2xl border border-white/12 bg-black/40 px-6 py-3 text-sm font-bold text-zinc-200 transition hover:border-gold-400/25"
            >
              Área da conta
            </Link>
          </div>
        </header>

        <section className="mb-14 rounded-3xl border border-gold-400/15 bg-zinc-950/40 p-6 sm:p-10">
          <h2 className="text-center font-display text-xl font-bold text-white sm:text-2xl">
            Sistema de conteúdo
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            <TierCard title="Público" subtitle="Aberto" body="Listagens e leitura integral sem assinatura." />
            <TierCard
              title="Premium"
              subtitle="Assinatura"
              body="Análises e picks reservados a assinantes — pré-visualização gratuita e leitura integral após desbloquear."
            />
            <TierCard
              title="Exclusivo"
              subtitle="Dentro do premium"
              body="Marcas editoriais especiais para leitores mais próximos do projeto — mesmo rigor, fila editorial mais restrita."
            />
          </div>
        </section>

        <section id="beneficios" className="mb-14 scroll-mt-24">
          <h2 className="text-center font-display text-xl font-bold text-white sm:text-2xl">
            Benefícios
          </h2>
          <ul className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
            {beneficios.map(({ icon: Icon, titulo, texto }) => (
              <li
                key={titulo}
                className="commercial-card-elevated border border-amber-900/35 bg-gradient-to-b from-[#0c0a06] to-black p-6 text-center shadow-[0_20px_50px_-28px_rgba(0,0,0,.85)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/50 text-amber-400">
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-amber-100">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="planos"
          className="mb-14 scroll-mt-24 rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#120f08] via-black to-black p-8 text-center shadow-[0_32px_80px_-28px_rgba(217,119,6,.15)] sm:p-12"
        >
          <div className="mx-auto mb-8 inline-flex items-center gap-2 text-amber-200/90">
            <CreditCard className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            <h2 className="font-display text-2xl font-bold text-white">Planos futuros</h2>
          </div>
          <p className="mx-auto max-w-lg text-sm text-zinc-500">
            Estrutura para Mercado Pago e Stripe — preços em definição. O estado da assinatura
            continuará visível na área da tua conta até existir uma página dedicada de subscrições.
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-5 text-left sm:grid-cols-2">
            {PLACEHOLDER_PLANS.map((plan) => (
              <li
                key={plan.id}
                className="rounded-2xl border border-gold-400/18 bg-black/50 p-6 text-sm text-zinc-400"
              >
                <p className="font-display text-lg font-bold text-gold-100">{plan.name}</p>
                <p className="mt-2 leading-relaxed">{plan.description}</p>
                <p className="mt-3 text-xs uppercase tracking-wider text-zinc-600">
                  Intervalo: {plan.interval} · Preço BRL:{" "}
                  {plan.priceCentsBrl != null ? `R$ ${(plan.priceCentsBrl / 100).toFixed(2)}` : "a definir"}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  Gateways previstos: {plan.providers.join(", ")}
                </p>
                <ul className="mt-3 list-inside list-disc text-xs text-zinc-500">
                  {plan.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={tg}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            >
              Telegram oficial
            </a>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center rounded-xl border border-amber-500/45 bg-black/50 px-8 py-3.5 text-sm font-bold text-amber-100 transition hover:bg-amber-950/30"
            >
              Contacto comercial
            </Link>
          </div>
        </section>

        <p className="text-center">
          <Link href="/" className="text-sm font-medium text-amber-500/90 hover:text-amber-400">
            ← Voltar ao início
          </Link>
        </p>
      </CommercialPageShell>
    </div>
  );
}

function TierCard(props: { title: string; subtitle: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/45 p-5 text-left">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{props.subtitle}</p>
      <p className="mt-2 font-display text-lg font-bold text-white">{props.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{props.body}</p>
    </div>
  );
}
