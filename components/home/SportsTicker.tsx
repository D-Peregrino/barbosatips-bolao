"use client";

import type { HomeTickerItem } from "@/lib/home/home-ticker";
import { cn } from "@/lib/utils";

function toneClasses(tone: HomeTickerItem["tone"]): string {
  switch (tone) {
    case "green":
      return "border-emerald-500/35 bg-emerald-950/35 text-emerald-100/95";
    case "red":
      return "border-red-500/35 bg-red-950/30 text-red-100/95";
    case "gold":
      return "border-amber-500/40 bg-amber-950/25 text-amber-100/95";
    default:
      return "border-zinc-600/50 bg-zinc-950/50 text-zinc-200";
  }
}

export type SportsTickerProps = {
  items: HomeTickerItem[];
  className?: string;
  /** Faixa mais fina (ex.: barra global LIVE). */
  variant?: "default" | "slim";
};

/**
 * Faixa tipo ESPN: odds, jogos, greens e reds em scroll suave (respeita prefers-reduced-motion).
 */
export function SportsTicker({
  items,
  className,
  variant = "default",
}: SportsTickerProps) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];
  const slim = variant === "slim";

  return (
    <div
      className={cn(
        "relative border-y border-amber-500/20 bg-gradient-to-r from-black via-zinc-950 to-black",
        slim ? "border-amber-500/15 bg-gradient-to-r from-zinc-950 via-black to-zinc-950" : null,
        className,
      )}
      role="marquee"
      aria-label="Últimas picks, análises e odds em movimento"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent sm:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent sm:w-24"
        aria-hidden
      />

      <div className={cn("overflow-hidden", slim ? "py-1.5" : "py-2.5 sm:py-3")}>
        <div
          className={cn(
            "flex w-max gap-4 pr-4 sm:gap-6",
            slim ? "animate-live-bar-ticker" : "animate-home-ticker",
          )}
        >
          {loop.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className={cn(
                "flex shrink-0 items-center rounded-xl border shadow-sm transition duration-300 will-change-transform motion-safe:hover:scale-[1.02]",
                slim
                  ? "gap-2 rounded-lg px-3 py-1.5"
                  : "gap-3 px-4 py-2 hover:border-amber-400/45 hover:shadow-[0_0_28px_-6px_rgba(245,158,11,0.22)]",
                toneClasses(item.tone),
              )}
            >
              <span
                className={cn(
                  "font-display font-bold uppercase tracking-[0.12em] text-white/90",
                  slim ? "text-[10px] tracking-[0.1em]" : "text-[11px]",
                )}
              >
                {item.headline}
              </span>
              <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
              <span
                className={cn(
                  "font-medium tabular-nums text-white/70",
                  slim ? "text-[10px]" : "text-[11px] sm:text-xs",
                )}
              >
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
