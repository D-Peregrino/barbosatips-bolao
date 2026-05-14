import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SportsRibbonProps = {
  /** Texto curto em caps (ex.: radar, ao vivo). */
  kicker: string;
  className?: string;
  children?: ReactNode;
};

/** Faixa esportiva decorativa entre seções — profundidade sem anúncio real. */
export function SportsRibbon({ kicker, className, children }: SportsRibbonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-amber-500/15 bg-gradient-to-r from-zinc-950/90 via-black to-zinc-950/90 py-3 sm:py-3.5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, rgba(245,158,11,0.07) 45%, transparent 88%)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center justify-center gap-1 px-4 text-center sm:flex-row sm:gap-4">
        <p className="font-display text-[10px] font-black uppercase tracking-[0.42em] text-amber-300/95 sm:text-[11px]">
          {kicker}
        </p>
        {children ? (
          <div className="text-[11px] font-medium text-zinc-500 sm:text-xs">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
