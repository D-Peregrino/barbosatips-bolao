import type { Metadata } from "next";
import Link from "next/link";
import { BrandShield } from "@/components/brand/BrandShield";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Sem ligação · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: true },
};

export default function OfflinePage() {
  return (
    <div className="commercial-page-bg flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 pb-24 pt-12 text-center text-cream">
      <BrandShield size="lg" glow="soft" className="opacity-95" />
      <h1 className="mt-8 font-display text-2xl font-bold text-white sm:text-3xl">
        Sem ligação à rede
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
        Algumas páginas que visitaste podem estar em cache. Verifica os dados móveis ou o Wi‑Fi e tenta
        novamente.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-[44px] min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-gold-600 to-amber-600 px-8 text-sm font-bold text-pitch-950 shadow-lg transition hover:brightness-110 active:scale-[0.99]"
      >
        Ir ao início
      </Link>
    </div>
  );
}
