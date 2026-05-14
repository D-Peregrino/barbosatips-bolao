import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export type VipBadgeProps = {
  className?: string;
  /** Tamanho compacto para cards em grelha. */
  compact?: boolean;
};

/** Badge VIP — editorial exclusivo (acesso ainda via mesma flag premium). */
export function VipBadge({ className, compact }: VipBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-gold-400/50 bg-gradient-to-r from-[#1a150c] to-black px-2 py-0.5 font-display font-black uppercase tracking-[0.16em] text-gold-100 shadow-[0_0_22px_-8px_rgba(201,162,39,0.35)]",
        compact ? "text-[8px]" : "text-[9px]",
        className,
      )}
      aria-label="Conteúdo VIP exclusivo"
    >
      <Crown className={cn("shrink-0 text-gold-300", compact ? "h-2.5 w-2.5" : "h-3 w-3")} strokeWidth={2.2} aria-hidden />
      VIP
    </span>
  );
}
