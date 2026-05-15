import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { MarketBoardClient } from "@/components/admin/markets/MarketBoardClient";
import { siteConfig } from "@/config/site";
import { buildMarketBoard } from "@/lib/betting/build-market-board";
import { getMarketEvSnapshotSummary } from "@/lib/betting/market-ev-snapshots";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: `Mercados EV+ · Admin · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default async function AdminMercadosPage() {
  const [board, snapshotSummary] = await Promise.all([
    buildMarketBoard(),
    getMarketEvSnapshotSummary(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Valor esperado
        </p>
        <div className="mt-2 flex items-start gap-3">
          <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Central de mercados EV+
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-400">
              Cruza fixtures da API-Football, odds da The Odds API e o motor EV para
              destacar Over 2.5, BTTS e vitórias com edge positivo — ordenado por valor
              esperado.
            </p>
          </div>
        </div>
      </header>

      {!board.ok ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {board.error}
        </p>
      ) : board.rows.length === 0 ? (
        <div className="space-y-2">
          <p className="rounded-xl border border-dashed border-stone-700 py-12 text-center text-stone-500">
            Nenhum mercado com odds e tendências para hoje. Verifica as chaves API e as
            ligas em MARKET_BOARD_SPORT_KEYS.
          </p>
          <p className="text-center text-xs text-stone-600">
            {board.meta.fixturesTotal} fixtures · {board.meta.fixturesMatched} cruzados
          </p>
        </div>
      ) : (
        <MarketBoardClient
          rows={board.rows}
          meta={board.meta}
          snapshotSummary={snapshotSummary}
        />
      )}
    </div>
  );
}
