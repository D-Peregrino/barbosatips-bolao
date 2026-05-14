import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumLockBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/45 bg-black/55 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/95 shadow-sm",
        className,
      )}
      aria-label="Conteúdo premium"
    >
      <Lock className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2.5} aria-hidden />
      Premium
    </span>
  );
}
