"use client";

import type { ReactNode } from "react";
import { OpsErrorBoundary } from "@/components/ops/OpsErrorBoundary";

function ExperimentalFallback(): ReactNode {
  return (
    <div className="rounded-xl border border-dashed border-gold-400/25 bg-pitch-900/40 px-4 py-3 text-center text-xs text-cream-muted">
      Pré-visualização temporariamente indisponível.
    </div>
  );
}

/** Envolve ilhas experimentais: crash isolado + fallback leve. */
export function SafeExperimentalBoundary({ children }: { children: ReactNode }) {
  return (
    <OpsErrorBoundary scope="experimental_ui" fallback={<ExperimentalFallback />}>
      {children}
    </OpsErrorBoundary>
  );
}
