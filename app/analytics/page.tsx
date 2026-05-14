import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { loadAnalyticsPagePayload } from "@/lib/analytics/load-analytics-page";

export const dynamic = "force-dynamic";

const base = siteConfig.url.replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Analytics | ${siteConfig.shortTitle}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${base}/analytics` },
  };
}

export default async function AnalyticsPage() {
  const { picks, leads, analises } = await loadAnalyticsPagePayload();

  return (
    <div className="min-h-screen bg-[#030201] pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(139,92,246,.09),transparent_50%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
        <header className="mb-10 flex flex-col gap-4 border-b border-zinc-800/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-violet-300/95">
              <BarChart3 className="h-6 w-6" strokeWidth={2} aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Analytics</p>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Inteligência <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">BarbosaTips</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-500">
              Painel interno: métricas reais onde a BD já suporta (picks, leads), proxies claros para
              conteúdo sem tracking, e secções reservadas para GA4, GSC, PostHog e Plausible.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/operacional"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
            >
              Operacional
            </Link>
            <Link
              href="/admin-picks"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-800/50 bg-emerald-950/25 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-500/50"
            >
              Admin picks
            </Link>
          </div>
        </header>

        <AnalyticsDashboard picks={picks} leads={leads} analises={analises} />
      </div>
    </div>
  );
}
