import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { CheckoutPreferenceForm } from "@/components/payments/CheckoutPreferenceForm";
import { siteConfig } from "@/config/site";
import { getPaymentProduct, getPaymentProductCheckoutError } from "@/lib/payments/products";

const PRODUCT_ALIASES: Record<string, string> = {
  "discord-ouvinte": "discord_ouvinte",
  "discord-voz": "discord_voz",
  "bot-barbosa": "bot_barbosa",
};

type Props = {
  params: { product: string };
};

function normalizeProductSlug(product: string): string {
  return PRODUCT_ALIASES[product] ?? product;
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getPaymentProduct(normalizeProductSlug(params.product));
  return {
    title: product
      ? `Checkout ${product.title} · ${siteConfig.shortTitle}`
      : `Checkout · ${siteConfig.shortTitle}`,
    robots: { index: false, follow: false },
  };
}

export default function CheckoutProductPage({ params }: Props) {
  const product = getPaymentProduct(normalizeProductSlug(params.product));
  if (!product) notFound();
  const disabledReason = getPaymentProductCheckoutError(product);

  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <section className="mx-auto max-w-2xl rounded-3xl border border-gold-400/20 bg-black/70 p-8">
          <div className="text-center">
            <CreditCard className="mx-auto h-10 w-10 text-gold-300" aria-hidden />
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">
              Checkout Mercado Pago
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-white">{product.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Após a confirmação do pagamento, o acesso é liberado automaticamente
              para o email informado se ele existir no Supabase Auth.
            </p>
          </div>

          <CheckoutPreferenceForm
            productCode={product.code}
            productTitle={product.title}
            productDescription={product.description}
            amount={product.amount}
            disabledReason={disabledReason}
          />

          <div className="mt-6 text-center">
            <Link
              href="/acesso"
              className="text-xs font-semibold text-gold-300 underline-offset-2 hover:underline"
            >
              Voltar para acessos
            </Link>
          </div>
        </section>
      </CommercialPageShell>
    </div>
  );
}
