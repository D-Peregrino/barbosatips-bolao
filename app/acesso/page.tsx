import type { Metadata } from "next";
import Link from "next/link";
import { Crown, LockKeyhole, ShoppingBag, Trophy } from "lucide-react";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Acesso · ${siteConfig.shortTitle}`,
  description: "Escolha entre Bolão, VIP Premium, Lojinha ou área Admin BarbosaTips.",
};

const cards = [
  {
    icon: Trophy,
    title: "Bolão Barbosa",
    description: "Produto de pagamento único para participar do bolão oficial BarbosaTips.",
    button: "Entrar no Bolão",
    href: "/bolao/login",
  },
  {
    icon: Crown,
    title: "Barbosa VIP Premium",
    description: "Assinatura que libera Picks Premium, Central EV+ e Football API Insights.",
    button: "Assinar VIP Premium",
    href: "/vip",
  },
  {
    icon: ShoppingBag,
    title: "Lojinha do Barbosa",
    description: "Produtos avulsos do ecossistema BarbosaTips.",
    items: ["Discord Ouvinte", "Bot do Barbosa", "Discord com Voz"],
    button: "Ver Lojinha",
    href: "/loja",
  },
  {
    icon: LockKeyhole,
    title: "Admin",
    description: "Área restrita da equipe BarbosaTips.",
    button: "Acessar Admin",
    href: "/admin",
  },
];

export default function AcessoPage() {
  return (
    <div className="commercial-page-bg pb-20 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="mb-10 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">
            Acessos BarbosaTips
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Escolha a área correta
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            VIP, Bolão, Lojinha e Admin são produtos e permissões separadas. Uma
            compra não libera automaticamente outra área.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {cards.map(({ icon: Icon, title, description, items, button, href }) => (
            <article key={title} className="commercial-card-elevated border border-gold-400/12 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-400/25 bg-gold-400/[0.08] text-gold-200">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
              {items ? (
                <ul className="mt-4 space-y-1 text-sm text-zinc-300">
                  {items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={href}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 px-5 text-sm font-bold text-pitch-950 transition hover:brightness-105"
              >
                {button}
              </Link>
            </article>
          ))}
        </section>
      </CommercialPageShell>
    </div>
  );
}
