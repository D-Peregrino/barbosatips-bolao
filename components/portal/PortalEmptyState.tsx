import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortalEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** CTA extra (ex.: YouTube). `http`/`https` abre em novo separador. */
  tertiaryHref?: string;
  tertiaryLabel?: string;
  /** CTA extra interna (ex.: bolão). */
  quaternaryHref?: string;
  quaternaryLabel?: string;
};

/**
 * Estado vazio editorial — contraste alto, CTAs opcionais.
 */
export function PortalEmptyState({
  icon: Icon,
  title,
  description,
  className,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  tertiaryHref,
  tertiaryLabel,
  quaternaryHref,
  quaternaryLabel,
}: PortalEmptyStateProps) {
  const tertiaryExternal = tertiaryHref?.startsWith("http") ?? false;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold-400/15 bg-gradient-to-b from-pitch-900/95 to-[#060504] px-6 py-14 text-center shadow-[0_28px_70px_-40px_rgba(0,0,0,0.92)] sm:px-10 sm:py-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(201,162,39,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-400/25 bg-gold-400/[0.07] text-gold-200 shadow-[0_0_40px_-12px_rgba(201,162,39,0.35)]">
          <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-300 sm:text-[15px]">{description}</p>
        {(primaryHref && primaryLabel) ||
        (secondaryHref && secondaryLabel) ||
        (tertiaryHref && tertiaryLabel) ||
        (quaternaryHref && quaternaryLabel) ? (
          <div className="mt-8 flex w-full flex-col flex-wrap items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {primaryHref && primaryLabel ? (
              <Link
                href={primaryHref}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 px-6 text-sm font-bold text-pitch-950 shadow-lg transition hover:brightness-105 sm:max-w-[220px]"
              >
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-stone-100 transition hover:border-gold-400/30 hover:text-white sm:max-w-[220px]"
              >
                {secondaryLabel}
              </Link>
            ) : null}
            {tertiaryHref && tertiaryLabel ? (
              tertiaryExternal ? (
                <a
                  href={tertiaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/30 px-6 text-sm font-semibold text-red-50 transition hover:border-red-400/60 sm:max-w-[220px]"
                >
                  {tertiaryLabel}
                </a>
              ) : (
                <Link
                  href={tertiaryHref}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-stone-100 transition hover:border-gold-400/30 hover:text-white sm:max-w-[220px]"
                >
                  {tertiaryLabel}
                </Link>
              )
            ) : null}
            {quaternaryHref && quaternaryLabel ? (
              <Link
                href={quaternaryHref}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-950/25 px-6 text-sm font-semibold text-amber-100 transition hover:border-amber-400/50 sm:max-w-[220px]"
              >
                {quaternaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
