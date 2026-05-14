import type { Metadata } from "next";
import Link from "next/link";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = `Conta | ${siteConfig.shortTitle}`;
  const description = "Favoritos, feed personalizado, histórico e preferências de notificação.";
  return buildPageMetadata({
    title,
    description,
    path: "/dashboard",
    keywords: buildKeywordsFromParts(["conta", "dashboard", "favoritos"]),
  });
}

export default function DashboardPage() {
  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <header className="commercial-card-elevated mb-10 max-w-3xl border-b border-gold-400/15 p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400/95">Área pessoal</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Acesso rápido ao feed, favoritos e preferências — tudo num só lugar premium.
          </p>
        </header>

        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
          <Link
            href="/meu-feed"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Principal</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Meu feed</h2>
            <p className="mt-2 text-sm text-zinc-500">Picks e análises dos desportos que segues, favoritos e alertas.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">Abrir →</span>
          </Link>
          <Link
            href="/meu-feed?tab=favoritos"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Guardados</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Favoritos</h2>
            <p className="mt-2 text-sm text-zinc-500">Lista curada de picks e análises com o teu coração.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">Ver →</span>
          </Link>
          <Link
            href="/meu-feed?tab=historico"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Atividade</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Histórico</h2>
            <p className="mt-2 text-sm text-zinc-500">Linha do tempo de favoritos e seguimentos.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">Ver →</span>
          </Link>
          <Link
            href="/meu-feed?tab=prefs"
            className="commercial-card-elevated group border p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/35"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">Futuro</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Preferências</h2>
            <p className="mt-2 text-sm text-zinc-500">Alertas in-app e toggles para push, e-mail e Telegram.</p>
            <span className="mt-4 inline-flex text-xs font-bold text-gold-300 group-hover:underline">Configurar →</span>
          </Link>
        </div>
      </CommercialPageShell>
    </div>
  );
}
