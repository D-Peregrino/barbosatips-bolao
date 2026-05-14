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
};

/**
 * Faixa tipo ESPN: odds, jogos, greens e reds em scroll suave (respeita prefers-reduced-motion).
 */
export function SportsTicker({ items, className }: SportsTickerProps) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div
      className={cn(
        "relative border-y border-amber-500/20 bg-gradient-to-r from-black via-zinc-950 to-black",
        className,
      )}
      role="marquee"
      aria-label="Destaques ao vivo: odds e resultados"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent sm:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent sm:w-24"
        aria-hidden
      />

      <div className="overflow-hidden py-2.5 sm:py-3">
        <div className="flex w-max animate-home-ticker gap-4 pr-4 sm:gap-6">
          {loop.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl border px-4 py-2 shadow-sm transition duration-300 will-change-transform",
                "hover:border-amber-400/45 hover:shadow-[0_0_28px_-6px_rgba(245,158,11,0.22)]",
                toneClasses(item.tone),
              )}
            >
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
                {item.headline}
              </span>
              <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
              <span className="text-[11px] font-medium tabular-nums text-white/70 sm:text-xs">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
