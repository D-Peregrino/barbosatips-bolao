import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Crown, Lock } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import { dashboardPlanSnapshot } from "@/lib/premium/dashboard-plan-copy";
import { PLACEHOLDER_PLANS } from "@/lib/billing/billing-roadmap";
import { betaVipHubCtaLabel, betaVipPageHref } from "@/lib/beta/cta-hrefs";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = `Conta | ${siteConfig.shortTitle}`;
  const description =
    "Favoritos, feed, plano futuro e permissões — área pessoal BarbosaTips.";
  return buildPageMetadata({
    title,
    description,
    path: "/dashboard",
    keywords: buildKeywordsFromParts(["conta", "dashboard", "plano", "VIP"]),
    noindex: true,
  });
}

export default async function DashboardPage() {
  const access = await getPremiumAccess();
  const plan = dashboardPlanSnapshot(access);
  const planPreview = PLACEHOLDER_PLANS[0];

  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="commercial-card-elevated mb-10 max-w-3xl border-b border-gold-400/15 p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400/95">
            Área pessoal
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Acesso rápido ao feed e favoritos — mais blocos para plano, assinaturas e permissões quando
            os gateways estiverem ligados.
          </p>
        </header>

        <section className="mb-10 max-w-4xl">
          <h2 className="font-display text-lg font-bold text-white">Plano e permissões (estrutura)</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Estado derivado da sessão actual — sem cobrança nem webhooks ainda.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="commercial-card-elevated border border-gold-400/15 p-5">
              <div className="flex items-center gap-2 text-gold-300/95">
                <Crown className="h-4 w-4" strokeWidth={2} aria-hidden />
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Plano</p>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-white">{plan.headline}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{plan.subline}</p>
            </div>
            <div className="commercial-card-elevated border border-white/10 p-5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Permissões futuras
                </p>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                Leitura premium / VIP, filas de notificação e limites por plano serão aplicados aqui com
                base no mesmo modelo de conta.
              </p>
            </div>
            <div className="commercial-card-elevated border border-white/10 p-5">
              <div className="flex items-center gap-2 text-zinc-400">
                <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Assinaturas
                </p>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                Próximo passo: Mercado Pago e Stripe. Placeholder de plano:{" "}
                <span className="font-semibold text-zinc-200">{planPreview?.name ?? "VIP"}</span> (
                preço ainda não definido).
              </p>
            </div>
          </div>
        </section>

        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
          <Link
            href="/meu-feed"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Principal</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Meu feed</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Picks e análises dos desportos que segues, favoritos e alertas.
            </p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">
              Abrir →
            </span>
          </Link>
          <Link
            href="/meu-feed?tab=favoritos"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Guardados</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Favoritos</h2>
            <p className="mt-2 text-sm text-zinc-500">Lista curada de picks e análises com o teu coração.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">
              Ver →
            </span>
          </Link>
          <Link
            href="/meu-feed?tab=historico"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Atividade</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Histórico</h2>
            <p className="mt-2 text-sm text-zinc-500">Linha do tempo de favoritos e seguimentos.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">
              Ver →
            </span>
          </Link>
          <Link
            href="/meu-feed?tab=prefs"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Futuro</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Preferências</h2>
            <p className="mt-2 text-sm text-zinc-500">Alertas in-app e toggles para push, e-mail e Telegram.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">
              Configurar →
            </span>
          </Link>
          <Link
            href={betaVipPageHref()}
            className="commercial-card-elevated group border border-gold-400/20 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Comercial</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">{betaVipHubCtaLabel()}</h2>
            <p className="mt-2 text-sm text-zinc-500">Canais oficiais, avisos e benefícios alinhados ao projeto.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">
              Ver página →
            </span>
          </Link>
          <Link
            href="/premium"
            className="commercial-card-elevated group border border-amber-500/20 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">Assinatura</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Premium</h2>
            <p className="mt-2 text-sm text-zinc-500">Camadas de conteúdo e placeholders de planos.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-amber-300 group-hover:underline">
              Ver página →
            </span>
          </Link>
        </div>
      </CommercialPageShell>
    </div>
  );
}
