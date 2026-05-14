import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400/80">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-cream md:text-5xl">
        Fora de campo
      </h1>
      <p className="mt-4 text-base text-cream-muted">
        Esta rota não existe ou foi movida. Verifica o endereço ou regressa ao hub.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-gold-400 px-6 py-3 text-sm font-semibold text-pitch-950 shadow-lg shadow-gold-400/20 transition hover:bg-gold-300"
        >
          Ir ao início
        </Link>
        <Link
          href="/analises"
          className="inline-flex items-center justify-center rounded-xl border border-white/12 px-6 py-3 text-sm text-cream-muted transition hover:border-white/20 hover:text-cream"
        >
          Análises
        </Link>
      </div>
    </div>
  );
}
