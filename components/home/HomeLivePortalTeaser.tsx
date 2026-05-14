import Link from "next/link";
import { LiveBadge } from "@/components/live/LiveBadge";
import type { LiveSummaryPayload } from "@/lib/live/types";
import { cn } from "@/lib/utils";

export type HomeLivePortalTeaserProps = {
  summary: LiveSummaryPayload;
  className?: string;
};

/** Faixa editorial na home: reforça o portal “ao vivo” com dados reais do SSR. */
export function HomeLivePortalTeaser({
  summary,
  className,
}: HomeLivePortalTeaserProps) {
  const activity = summary.activity ?? [];
  const line =
    activity[0]?.text?.trim() ||
    "Centro live sincronizado com as quick picks.";
  return (
    <div
      className={cn(
        "border-y border-amber-500/15 bg-gradient-to-r from-zinc-950/80 via-black/90 to-zinc-950/80",
        className,
      )}
    >
      <div className="container-site flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <LiveBadge variant="live" />
          <LiveBadge variant="hot" />
          <span
            className="min-w-0 flex-1 truncate text-[11px] text-zinc-400 sm:text-xs"
            title={line}
          >
            <span className="font-semibold text-zinc-300">Pulse · </span>
            {line}
          </span>
        </div>
        <Link
          href="/live"
          className="shrink-0 self-start rounded-xl border border-gold-400/30 bg-gold-400/[0.07] px-4 py-2 text-center font-display text-[11px] font-bold uppercase tracking-[0.18em] text-gold-100 transition hover:border-gold-300/45 hover:bg-gold-400/12 sm:self-auto"
        >
          Abrir centro live
        </Link>
      </div>
    </div>
  );
}
