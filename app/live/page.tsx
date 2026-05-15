import type { Metadata } from "next";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { LiveCenterClient } from "@/components/live/LiveCenterClient";
import { PickCard } from "@/components/picks/PickCard";
import { siteConfig } from "@/config/site";
import { loadLiveSummaryForViewer } from "@/lib/live/load-live-summary";

const base = siteConfig.url.replace(/\/$/, "");

export const metadata: Metadata = {
  title: `Live · ${siteConfig.shortTitle}`,
  description:
    "Centro ao vivo BarbosaTips — picks recentes, atividade, trending e sequências em atualização leve.",
  alternates: { canonical: `${base}/live` },
  openGraph: {
    title: `Live | ${siteConfig.name}`,
    description:
      "Portal ao vivo com odds, greens, reds e movimento editorial do dia.",
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: `${base}/live`,
  },
};

export default async function LivePage() {
  const { summary, viewerCanViewPremium, picks } = await loadLiveSummaryForViewer();
  const cards = picks.slice(0, 14);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(245, 158, 11, 0.12), transparent 50%), radial-gradient(ellipse 45% 35% at 0% 40%, rgba(52, 211, 153, 0.05), transparent 42%)",
        }}
        aria-hidden
      />

      <CommercialPageShell>
        <div className="w-full min-w-0 space-y-10">
          <div className="lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <header className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/50 via-black/90 to-zinc-950 p-6 sm:p-10">
            <div
              className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
              aria-hidden
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
              Portal ao vivo
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Centro <span className="text-gold-gradient">LIVE</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Picks recentes, pulso editorial e trending — atualização automática leve,
              sem ruído visual. O mesmo critério de listagem da home (premium conforme a
              tua sessão).
            </p>
          </header>

          <LiveCenterClient initialSummary={summary}>
            <section className="rounded-2xl border border-amber-500/15 bg-zinc-950/40 p-5 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">
                  Picks recentes
                </h2>
                <p className="text-xs text-zinc-500">
                  Cards estáveis (SSR) · métricas acima atualizam em background
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((pick) => (
                  <PickCard
                    key={pick.id}
                    pick={pick}
                    viewerCanViewPremium={viewerCanViewPremium}
                  />
                ))}
              </div>
            </section>
          </LiveCenterClient>

          <div className="hidden md:block">
            <SponsorSlot slot="homeHorizontal" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
