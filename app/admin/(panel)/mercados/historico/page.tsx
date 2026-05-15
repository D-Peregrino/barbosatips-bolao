import type { Metadata } from "next";
import { History } from "lucide-react";
import { MarketSnapshotHistory } from "@/components/admin/markets/MarketSnapshotHistory";
import { siteConfig } from "@/config/site";
import { todayDateBrazil } from "@/lib/api-football/dates";
import {
  listMarketEvSnapshots,
  listSnapshotDates,
} from "@/lib/betting/market-ev-snapshots";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Histórico EV+ · Admin · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default async function AdminMercadosHistoricoPage() {
  const [rows, dates] = await Promise.all([
    listMarketEvSnapshots({ limit: 500 }),
    listSnapshotDates(),
  ]);

  const campeonatos = Array.from(new Set(rows.map((r) => r.campeonato))).sort((a, b) =>
    a.localeCompare(b),
  );

  const defaultDate = dates[0] ?? todayDateBrazil();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Valor esperado
        </p>
        <div className="mt-2 flex items-start gap-3">
          <History className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Histórico de snapshots EV+
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-400">
              Mercados guardados no Supabase — filtra por data, tier, mercado ou campeonato.
              Ordenação por EV decrescente.
            </p>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-700 py-16 text-center text-stone-500">
          Ainda não há snapshots. Volta à central EV+ e clica em &quot;Salvar snapshot&quot;.
        </p>
      ) : (
        <MarketSnapshotHistory
          rows={rows}
          dates={dates}
          campeonatos={campeonatos}
          defaultDate={defaultDate}
        />
      )}
    </div>
  );
}
