import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Checkout VIP · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default function VipCheckoutPage() {
  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <section className="mx-auto max-w-2xl rounded-3xl border border-gold-400/20 bg-black/70 p-8 text-center">
          <Crown className="mx-auto h-10 w-10 text-gold-300" aria-hidden />
          <h1 className="mt-4 font-display text-3xl font-bold text-white">VIP Premium</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Checkout temporário da assinatura recorrente VIP Premium. Mercado Pago será
            integrado depois.
          </p>
          <Link
            href="/vip"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gold-400/35 px-5 text-sm font-bold text-gold-100 transition hover:bg-gold-400/10"
          >
            Voltar para VIP
          </Link>
        </section>
      </CommercialPageShell>
    </div>
  );
}
