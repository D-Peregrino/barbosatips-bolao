import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranking | BarbosaTips",
  description: "Ranking de tipsters e desempenho — BarbosaTips.",
};

export default function RankingPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-pitch-950">
      <div className="container-site px-4 py-12 md:py-16">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          BarbosaTips
        </p>
        <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">
          Ranking
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">
          Página em construção. Em breve você acompanha aqui o ranking de tipsters,
          greens e estatísticas do portal.
        </p>

        <div
          className="mt-10 max-w-lg rounded-xl border border-pitch-700 bg-pitch-900/80 p-6 shadow-card"
          style={{ borderColor: "rgba(245, 158, 11, 0.12)" }}
        >
          <p className="text-sm text-neutral-500">
            Enquanto isso, confira as tips e análises do dia.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tips"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-pitch-950 transition-opacity hover:opacity-90"
            >
              Tips do dia
            </Link>
            <Link
              href="/analises"
              className="inline-flex items-center justify-center rounded-lg border border-pitch-600 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:border-gold/40 hover:text-gold"
            >
              Análises
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
