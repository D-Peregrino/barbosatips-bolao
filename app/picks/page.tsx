import type { Metadata } from "next";
import { Send, Zap } from "lucide-react";
import Link from "next/link";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { listarQuickPicks, listarQuickPicksRecentes } from "@/lib/picks/queries";
import { calcularEstatisticasQuickPicksEncerradas } from "@/lib/picks/stats";
import { PickCard } from "@/components/picks/PickCard";
import { PicksStatsBar } from "@/components/picks/PicksStatsBar";
import { buildAutoMetaDescription } from "@/lib/seo/auto-meta-description";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { PortalSocialCtaBand } from "@/components/portal/PortalSocialCtaBand";
import { getCurrentUser, isPremiumUser } from "@/lib/access/permissions";

export const dynamic = "force-dynamic";
export const revalidate = siteConfig.revalidate.picks;

export async function generateMetadata(): Promise<Metadata> {
  const recent = await listarQuickPicksRecentes(12, true);
  const title = `Picks rápidas | ${siteConfig.shortTitle}`;
  const sports = Array.from(new Set(recent.map((r) => r.esporte))).filter(Boolean);
  const description = buildAutoMetaDescription([
    recent.length ? `${recent.length}+ linhas recentes` : "Flash picks com odd e confiança",
    sports.length ? sports.map((s) => s.replace(/-/g, " ")).join(", ") : "futebol, NBA, NFL",
    "mercados ao vivo, pendentes e resultado público BarbosaTips",
  ]);
  return buildPageMetadata({
    title,
    description,
    path: "/picks",
    keywords: buildKeywordsFromParts([
      "picks rápidas",
      "quick picks",
      "odds",
      "valor esperado",
      ...sports,
    ]),
  });
}

export default async function PicksPage() {
  const user = await getCurrentUser();
  const premiumAllowed = user ? await isPremiumUser(user.id) : false;
  const picks = premiumAllowed ? await listarQuickPicks(false) : [];
  const stats = calcularEstatisticasQuickPicksEncerradas(picks);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(34,197,94,.1),transparent_55%)]" />

      <CommercialPageShell>
        <div className="w-full min-w-0">
          <div className="mb-8 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <header className="commercial-card-elevated mb-10 max-w-3xl border-b border-emerald-500/15 p-6 pb-8 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
              Flash · Valor
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Picks <span className="text-gold">rápidas</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Linhas rápidas com odd e confiança —{" "}
              <span className="text-amber-300">ao vivo</span>,{" "}
              <span className="text-amber-200/90">pendente</span>,{" "}
              <span className="text-emerald-400">green</span>,{" "}
              <span className="text-red-400">red</span> ou{" "}
              <span className="text-zinc-400">void</span>.
            </p>
            <a
              href={siteConfig.hub.telegramPicks}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-6 text-sm font-bold text-white shadow-lg shadow-[#229ED9]/15 transition hover:brightness-110"
            >
              <Send className="h-4 w-4 shrink-0" aria-hidden />
              Receber picks no Telegram
            </a>
          </header>

          <SponsorSlot slot="feedBetween" className="mb-8" />

          {!premiumAllowed ? (
            <section className="mb-8 rounded-2xl border border-gold-400/20 bg-gradient-to-br from-gold-400/[0.08] via-black/70 to-black p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-300">
                Conteúdo VIP Premium
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">
                As picks completas são exclusivas para assinantes.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
                O VIP Premium libera as Picks Premium, a Central EV+ e o Football API
                Insights. Análises públicas continuam abertas em /analises.
              </p>
              <Link
                href="/vip"
                className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 px-6 text-sm font-bold text-pitch-950 shadow-lg transition hover:brightness-105"
              >
                Assinar VIP Premium
              </Link>
            </section>
          ) : null}

          {premiumAllowed && picks.length > 0 ? <PicksStatsBar stats={stats} /> : null}

          {!premiumAllowed ? null : picks.length === 0 ? (
            <PortalEmptyState
              icon={Zap}
              title="Ainda não há picks por aqui"
              description="Quando a equipa publicar linhas rápidas, elas aparecem nesta grelha. Entretanto, podes refrescar esta página, seguir a comunidade, ver o canal no YouTube ou entrar no bolão."
              primaryHref="/picks"
              primaryLabel="Ver picks"
              secondaryHref="/comunidade"
              secondaryLabel="Entrar na comunidade"
              tertiaryHref={siteConfig.hub.youtubeCanalUrl}
              tertiaryLabel="Assistir no YouTube"
              quaternaryHref="/bolao"
              quaternaryLabel="Participar do bolão"
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {picks.map((p) => (
                <li key={p.id}>
                  <PickCard pick={p} viewerCanViewPremium={premiumAllowed} />
                </li>
              ))}
            </ul>
          )}

          <PortalSocialCtaBand className="mt-10" />

          <div className="mt-10 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
