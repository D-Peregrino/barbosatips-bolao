"use client";

import type { LiveActivityLine } from "@/lib/live/types";
import { cn } from "@/lib/utils";

type Props = {
  lines: LiveActivityLine[];
  className?: string;
};

/**
 * Ticker fino com linhas editoriais (“pulse”) — ritmo igual ao slim ticker, texto sóbrio.
 */
export function ActivityPulseTicker({ lines, className }: Props) {
  if (lines.length === 0) return null;
  const loop = [...lines, ...lines];

  return (
    <div
      className={cn(
        "relative border-b border-white/[0.06] bg-gradient-to-r from-zinc-950 via-black to-zinc-950",
        className,
      )}
      role="marquee"
      aria-label="Últimas atividades no portal"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-black to-transparent sm:w-16" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black to-transparent sm:w-16" aria-hidden />
      <div className="overflow-hidden py-1.5">
        <div className="flex w-max gap-10 pr-8 animate-live-bar-ticker sm:gap-12">
          {loop.map((l, i) => (
            <span
              key={`${l.id}-${i}`}
              className="flex shrink-0 items-center gap-2 text-[11px] text-zinc-500 transition duration-300 hover:text-zinc-200"
            >
              <span
                className="relative flex h-1.5 w-1.5 shrink-0 motion-safe:animate-pulse"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/45 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
              </span>
              <span className="max-w-[min(72vw,420px)] truncate sm:max-w-[520px]">{l.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
