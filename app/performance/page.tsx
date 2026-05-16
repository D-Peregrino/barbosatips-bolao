import type { Metadata } from "next";
import { Activity } from "lucide-react";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { PerformanceDashboard } from "@/components/performance/PerformanceDashboard";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { PortalSocialCtaBand } from "@/components/portal/PortalSocialCtaBand";
import { siteConfig } from "@/config/site";
import {
  computePerformanceModelForPeriod,
  computePerformancePeriodStats,
  parsePerformancePeriod,
} from "@/lib/picks/performance-periods";
import { listarQuickPicksPerformance } from "@/lib/picks/queries";
import { buildAutoMetaDescription } from "@/lib/seo/auto-meta-description";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { buildPageMetadata } from "@/lib/seo/build-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const picks = await listarQuickPicksPerformance();
  const stats = computePerformancePeriodStats(picks, "30d");
  const taxa =
    stats.winratePct != null ? `taxa ~${stats.winratePct}%` : "métricas públicas";
  const roi =
    stats.roiPct != null ? `ROI ~${stats.roiPct}% (1u)` : "ROI 1u estimado";
  const description = buildAutoMetaDescription([
    `${stats.totalResolvidas} picks resolvidas (30d)`,
    `${stats.greens}G ${stats.reds}R`,
    taxa,
    roi,
  ]);
  return buildPageMetadata({
    title: `Performance · ${siteConfig.shortTitle}`,
    description,
    path: "/performance",
    keywords: buildKeywordsFromParts([
      "performance picks",
      "ROI",
      "taxa de acerto",
      "quick picks",
      "greens",
    ]),
  });
}

type PageProps = {
  searchParams?: { period?: string };
};

export default async function PerformancePage({ searchParams }: PageProps) {
  const picks = await listarQuickPicksPerformance();
  const period = parsePerformancePeriod(searchParams?.period);
  const periodStats = computePerformancePeriodStats(picks, period);
  const model = computePerformanceModelForPeriod(picks, period);
  const semDados = periodStats.totalResolvidas === 0 && model.totalPicks === 0;

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -15%, rgba(245, 158, 11, 0.14), transparent 52%), radial-gradient(ellipse 50% 40% at 100% 30%, rgba(59, 130, 246, 0.06), transparent 45%)",
        }}
        aria-hidden
      />

      <CommercialPageShell>
        <div className="w-full min-w-0 space-y-8">
          <div className="lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <header className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/50 via-black/90 to-zinc-950 p-6 sm:p-10">
            <div
              className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-amber-500/12 blur-3xl"
              aria-hidden
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
              Centro de performance
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Desempenho <span className="text-gold-gradient">público</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {semDados ? (
                <>
                  Aqui vais ver totais, taxa de acerto, sequências e gráficos à medida que as picks
                  públicas forem encerrando com resultado. Volta mais tarde ou segue os canais para
                  não perderes o arranque.
                </>
              ) : (
                <>
                  Totais por período (hoje, 7 dias, 30 dias ou geral), taxa de acerto, ROI estimado
                  (1 unidade por pick: vitória usa a odd, derrota −1, void 0), sequências e gráficos
                  — actualizados em cada visita a partir das picks publicadas no portal.
                </>
              )}
            </p>
          </header>

          {semDados ? (
            <PortalEmptyState
              icon={Activity}
              title="Métricas ainda sem histórico"
              description="Assim que existirem picks encerradas no portal, este painel mostra taxa, ROI e tendências de forma transparente. Entretanto, vê as picks em aberto, segue a comunidade ou entra no bolão."
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
            <PerformanceDashboard
              model={model}
              period={period}
              periodStats={periodStats}
            />
          )}

          <PortalSocialCtaBand className="mt-10" />
        </div>
      </CommercialPageShell>
    </div>
  );
}
