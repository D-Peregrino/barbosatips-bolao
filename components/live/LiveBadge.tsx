import { cn } from "@/lib/utils";

export type LiveBadgeVariant =
  | "live"
  | "hot"
  | "premium"
  | "green"
  | "red";

const styles: Record<
  LiveBadgeVariant,
  string
> = {
  live:
    "border-amber-400/45 bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/20",
  hot: "border-orange-400/40 bg-orange-950/40 text-orange-100",
  premium:
    "border-gold-400/45 bg-gold-400/[0.12] text-gold-100 shadow-[0_0_18px_-8px_rgba(201,162,39,0.35)]",
  green:
    "border-emerald-400/40 bg-emerald-500/12 text-emerald-100",
  red: "border-rose-400/35 bg-rose-950/40 text-rose-100",
};

const labels: Record<LiveBadgeVariant, string> = {
  live: "AO VIVO",
  hot: "HOT",
  premium: "PREMIUM",
  green: "GREEN",
  red: "RED",
};

export type LiveBadgeProps = {
  variant: LiveBadgeVariant;
  className?: string;
  /** Quando true, mostra só o ponto pulsante (apenas variant `live`). */
  dotOnly?: boolean;
};

export function LiveBadge({ variant, className, dotOnly }: LiveBadgeProps) {
  if (variant === "live" && dotOnly) {
    return (
      <span className={cn("relative flex h-2 w-2", className)} aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/55 opacity-55" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.14em]",
        styles[variant],
        className,
      )}
    >
      {variant === "live" ? (
        <>
          <LiveBadge variant="live" dotOnly className="mr-0.5" />
          {labels.live}
        </>
      ) : (
        labels[variant]
      )}
    </span>
  );
}
