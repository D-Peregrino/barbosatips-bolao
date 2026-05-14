"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";

type Props = { children: ReactNode; fallback: ReactNode };

/** Suspense explícito com fallback obrigatório (evita spinners implícitos). */
export function SafeSuspense({ children, fallback }: Props) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
