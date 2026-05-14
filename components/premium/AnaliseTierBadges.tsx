import type { AnaliseRow } from "@/lib/analises/types";
import { analiseContentTier } from "@/lib/premium/content-tier";
import { cn } from "@/lib/utils";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { VipBadge } from "@/components/premium/VipBadge";

export type AnaliseTierBadgesProps = {
  analise: AnaliseRow;
  className?: string;
  compact?: boolean;
};

/** Badges de camada (Premium / VIP) derivados do conteúdo — sem query extra. */
export function AnaliseTierBadges({
  analise,
  className,
  compact,
}: AnaliseTierBadgesProps) {
  const tier = analiseContentTier(analise);
  if (tier === "public") return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {tier === "exclusive" ? (
        <>
          <VipBadge compact={compact} />
          <PremiumLockBadge className={compact ? "scale-90" : undefined} />
        </>
      ) : (
        <PremiumLockBadge className={compact ? "scale-90" : undefined} />
      )}
    </div>
  );
}
