"use client";

import type { ReactNode } from "react";
import { OpsErrorBoundary } from "@/components/ops/OpsErrorBoundary";

type Props = {
  children: ReactNode;
  /** Identificador para logs correlacionados. */
  scope: string;
};

/**
 * Montagens client opcionais (PWA, leads, etc.): falha não derruba a página inteira.
 */
export function IsolatedClientMount({ children, scope }: Props) {
  return <OpsErrorBoundary scope={scope} fallback={null}>{children}</OpsErrorBoundary>;
}
