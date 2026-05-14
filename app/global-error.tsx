"use client";

import { useEffect } from "react";
import "./globals.css";
import { opsLogError } from "@/lib/ops/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    opsLogError("global_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-pitch-950 font-body text-cream-muted antialiased">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-full rounded-3xl border border-loss/25 bg-pitch-900/80 p-10 ring-1 ring-white/5">
            <h1 className="font-display text-2xl font-semibold text-cream md:text-3xl">
              Erro crítico
            </h1>
            <p className="mt-4 text-sm text-cream-muted">
              O layout base não conseguiu renderizar. Recarrega a página ou volta mais tarde.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold text-pitch-950 transition hover:bg-gold-300"
              >
                Tentar outra vez
              </button>
              <a
                href="/"
                className="rounded-xl border border-white/15 px-5 py-3 text-sm text-cream transition hover:border-white/25"
              >
                Página inicial
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
