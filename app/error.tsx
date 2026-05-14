"use client";

import { useEffect } from "react";
import Link from "next/link";
import { opsLogError } from "@/lib/ops/logger";
import { errorMessageForUser } from "@/lib/ops/errors";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    opsLogError("app_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative w-full overflow-hidden rounded-3xl border border-gold-400/20 bg-gradient-to-b from-pitch-800/90 to-pitch-950 p-10 shadow-[0_0_0_1px_rgba(201,162,39,0.08),0_24px_80px_rgba(0,0,0,0.45)]">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-gold-400/10 blur-3xl"
          aria-hidden
        />
        <p className="font-mono text-2xs uppercase tracking-[0.28em] text-gold-400/90">
          Erro · BarbosaTips
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-cream md:text-4xl">
          Algo falhou deste lado
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cream-muted">
          {errorMessageForUser(error)}
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold text-pitch-950 shadow-lg shadow-gold-400/15 transition hover:bg-gold-300"
          >
            Recarregar secção
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm text-cream transition hover:border-white/25 hover:text-cream"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
