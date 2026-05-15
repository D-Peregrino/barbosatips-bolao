import type { EvTier } from "@/lib/betting/ev-engine";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<EvTier, string> = {
  elite: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/45 shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)]",
  forte: "bg-emerald-600/15 text-emerald-300/95 ring-emerald-500/30",
  moderado: "bg-amber-500/15 text-amber-200 ring-amber-400/35",
  neutro: "bg-stone-700/50 text-stone-300 ring-stone-600/50",
  negativo: "bg-red-950/50 text-red-300 ring-red-800/50",
};

const TIER_LABELS: Record<EvTier, string> = {
  elite: "Elite",
  forte: "Forte",
  moderado: "Moderado",
  neutro: "Neutro",
  negativo: "Negativo",
};

export function EVBadge({ tier, className }: { tier: EvTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        TIER_STYLES[tier],
        className,
      )}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
