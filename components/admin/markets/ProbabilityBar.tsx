import { cn } from "@/lib/utils";

type Props = {
  real: number;
  implied: number;
  className?: string;
};

export function ProbabilityBar({ real, implied, className }: Props) {
  const realClamped = Math.min(100, Math.max(0, real));
  const impliedClamped = Math.min(100, Math.max(0, implied));

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-stone-800/90 ring-1 ring-stone-700/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-600/70 to-gold-400/90"
          style={{ width: `${realClamped}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
          style={{ left: `${impliedClamped}%` }}
          title={`Implícita ${impliedClamped.toFixed(1)}%`}
        />
      </div>
      <div className="flex justify-between text-[10px] tabular-nums text-stone-500">
        <span>Real {real.toFixed(1)}%</span>
        <span>Impl. {implied.toFixed(1)}%</span>
      </div>
    </div>
  );
}
