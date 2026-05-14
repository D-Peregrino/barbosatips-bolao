import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  max: number;
  /** Valores negativos (ex.: lucro) — barra cresce à esquerda do centro. */
  variant?: "positive" | "signed";
  className?: string;
};

export function AnalyticsBar({ label, value, max, variant = "positive", className }: Props) {
  const cap = Math.max(Math.abs(max), 1e-6);
  const pct = variant === "signed"
    ? Math.min(100, (Math.abs(value) / cap) * 100)
    : Math.min(100, (Math.max(0, value) / cap) * 100);

  const isNeg = value < 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
        <span className="line-clamp-1 font-medium text-zinc-300">{label}</span>
        <span className="shrink-0 tabular-nums text-zinc-500">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800/90">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-[width] duration-500",
            variant === "signed" && isNeg
              ? "from-rose-700 to-red-500"
              : "from-violet-600 to-fuchsia-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
