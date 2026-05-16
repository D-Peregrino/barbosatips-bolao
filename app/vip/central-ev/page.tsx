import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { MarketBoardClient } from "@/components/admin/markets/MarketBoardClient";
import { PremiumGate } from "@/components/vip/PremiumGate";
import { siteConfig } from "@/config/site";
import { getCurrentUser, isPremiumUser } from "@/lib/access/permissions";
import { buildMarketBoard } from "@/lib/betting/build-market-board";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Central EV+ VIP · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default async function VipCentralEvPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/vip/central-ev");

  const allowed = await isPremiumUser(user.id);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="mb-8 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">
            VIP Premium
          </p>
          <div className="mt-3 flex items-start gap-3">
            <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
            <div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Central EV+
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Versão VIP da Central EV+, sem botões administrativos, snapshots internos
                ou ações de edição.
              </p>
            </div>
          </div>
        </header>

        {!allowed ? (
          <PremiumGate
            title="Central EV+ exclusiva para VIP Premium"
            description="Assine para acessar oportunidades EV+, filtros e leitura visual de mercados."
          />
        ) : (
          <VipCentralEvContent />
        )}
      </CommercialPageShell>
    </div>
  );
}

async function VipCentralEvContent() {
  const board = await buildMarketBoard();
  if (!board.ok) {
    return (
      <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
        {board.error}
      </p>
    );
  }

  if (board.rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-700 py-12 text-center text-stone-500">
        Nenhum mercado EV+ disponível neste momento.
      </p>
    );
  }

  return <MarketBoardClient rows={board.rows} meta={board.meta} showAdminActions={false} />;
}
