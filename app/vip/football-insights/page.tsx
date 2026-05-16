import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { redirect } from "next/navigation";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { PremiumGate } from "@/components/vip/PremiumGate";
import { VipFootballInsightsPanel } from "@/components/vip/VipFootballInsightsPanel";
import { siteConfig } from "@/config/site";
import { getCurrentUser, isPremiumUser } from "@/lib/access/permissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Football API Insights · VIP · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default async function VipFootballInsightsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/vip/football-insights");

  const allowed = await isPremiumUser(user.id);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="mb-8 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">
            VIP Premium
          </p>
          <div className="mt-3 flex items-start gap-3">
            <Radio className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
            <div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Football API Insights
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Consulta visual de jogos e contexto sem chaves, edição ou ações administrativas.
              </p>
            </div>
          </div>
        </header>

        {!allowed ? (
          <PremiumGate
            title="Football API Insights exclusivo para VIP Premium"
            description="Assine para consultar jogos, status e sinais operacionais em uma visão segura para clientes."
          />
        ) : (
          <VipFootballInsightsPanel />
        )}
      </CommercialPageShell>
    </div>
  );
}
