import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Headphones, Mic2, ShoppingBag } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Lojinha do Barbosa · ${siteConfig.shortTitle}`,
  description: "Produtos avulsos do ecossistema BarbosaTips.",
};

const produtos = [
  {
    icon: Headphones,
    nome: "Discord Ouvinte",
    descricao: "Acesso ao Discord como ouvinte.",
    href: "/loja/checkout?produto=discord-ouvinte",
  },
  {
    icon: Bot,
    nome: "Bot do Barbosa",
    descricao: "Receba análises, alertas e oportunidades pelo Bot do Barbosa no Telegram.",
    href: "/loja/checkout?produto=bot-barbosa",
  },
  {
    icon: Mic2,
    nome: "Discord com Voz",
    descricao: "Acesso ao Discord com participação por voz.",
    href: "/loja/checkout?produto=discord-voz",
  },
];

export default function LojaPage() {
  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-200">
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            Lojinha do Barbosa
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">
            Produtos avulsos
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Itens independentes do VIP e do Bolão. Pagamento futuro via Mercado Pago.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {produtos.map(({ icon: Icon, nome, descricao, href }) => (
            <article key={nome} className="commercial-card-elevated border border-white/10 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-400/25 bg-gold-400/[0.08] text-gold-200">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold text-white">{nome}</h2>
              <p className="mt-2 min-h-[64px] text-sm leading-relaxed text-zinc-400">{descricao}</p>
              <Link
                href={href}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 px-5 text-sm font-bold text-pitch-950 transition hover:brightness-105"
              >
                Comprar acesso
              </Link>
            </article>
          ))}
        </section>
      </CommercialPageShell>
    </div>
  );
}
