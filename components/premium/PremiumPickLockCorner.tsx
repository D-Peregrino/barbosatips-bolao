import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentTier } from "@/lib/premium/content-tier";

export type PremiumPickLockCornerProps = {
  tier: ContentTier;
  className?: string;
};

/**
 * Cadeado discreto no canto do card — sensação premium sem competir com o resultado.
 */
export function PremiumPickLockCorner({ tier, className }: PremiumPickLockCornerProps) {
  const isExclusive = tier === "exclusive";
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 top-3 flex items-center justify-center rounded-full border bg-black/55 shadow-sm backdrop-blur-[2px]",
        isExclusive
          ? "h-8 w-8 border-gold-400/45 text-gold-200"
          : "h-7 w-7 border-amber-500/35 text-amber-100/90",
        className,
      )}
      aria-hidden
    >
      <Lock className={isExclusive ? "h-3.5 w-3.5" : "h-3 w-3"} strokeWidth={2.2} />
    </div>
  );
}
