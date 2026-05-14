"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Link from "next/link";
import { opsLogError } from "@/lib/ops/logger";
import { errorMessageForUser } from "@/lib/ops/errors";

type Props = {
  children: ReactNode;
  /** Identificador curto para logs (ex.: `pwa`, `leads`). */
  scope?: string;
  fallback?: ReactNode;
};

type State = { hasError: boolean };

export class OpsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    opsLogError(this.props.scope ?? "OpsErrorBoundary", error, {
      componentStack: info.componentStack?.slice(0, 800),
    });
  }

  private reset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-2xl border border-white/10 bg-pitch-900/70 p-6 text-center ring-1 ring-gold-400/10">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-gold-400/80">
            BarbosaTips
          </p>
          <p className="mt-3 font-display text-lg text-cream">Módulo indisponível</p>
          <p className="mt-2 text-sm text-cream-muted">
            {errorMessageForUser(undefined)}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-gold-400/35 bg-gold-400/10 px-4 py-2 text-sm font-medium text-gold-100 transition hover:bg-gold-400/15"
          >
            Tentar outra vez
          </button>
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-gold-300/90 underline-offset-4 hover:underline"
            >
              Ir para o início
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
