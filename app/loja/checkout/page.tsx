import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Checkout Loja · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

const labels: Record<string, string> = {
  "discord-ouvinte": "Discord Ouvinte",
  "bot-barbosa": "Bot do Barbosa",
  "discord-voz": "Discord com Voz",
};

export default function LojaCheckoutPage({
  searchParams,
}: {
  searchParams?: { produto?: string };
}) {
  const produto = searchParams?.produto ?? "";
  const label = labels[produto] ?? "Produto da Lojinha";

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <section className="mx-auto max-w-2xl rounded-3xl border border-gold-400/20 bg-black/70 p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-gold-300" aria-hidden />
          <h1 className="mt-4 font-display text-3xl font-bold text-white">{label}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Checkout temporário. A integração futura com Mercado Pago será feita sem
            misturar este produto com VIP, Bolão ou Admin.
          </p>
          <Link
            href="/loja"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gold-400/35 px-5 text-sm font-bold text-gold-100 transition hover:bg-gold-400/10"
          >
            Voltar para a Lojinha
          </Link>
        </section>
      </CommercialPageShell>
    </div>
  );
}
