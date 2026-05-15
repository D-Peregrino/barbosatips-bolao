import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { MarketResultsClient } from "@/components/admin/markets/MarketResultsClient";
import { siteConfig } from "@/config/site";
import { getMarketEvDashboardData } from "@/lib/betting/market-ev-results";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Resultados EV+ · Admin · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default async function AdminMercadosResultadosPage() {
  const dashboard = await getMarketEvDashboardData();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Link
        href="/admin/mercados"
        className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar aos mercados EV+
      </Link>

      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Tracking automático
        </p>
        <div className="mt-2 flex items-start gap-3">
          <BarChart3 className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Resultados EV+
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-400">
              Liquida snapshots guardados com o resultado final da API-Football (Over 2.5,
              BTTS, vitória casa/fora). Lucro unitário stake 1; yield = lucro médio por aposta
              (%).
            </p>
          </div>
        </div>
      </header>

      <MarketResultsClient dashboard={dashboard} />
    </div>
  );
}
