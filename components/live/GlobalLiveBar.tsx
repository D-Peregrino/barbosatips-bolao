"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SportsTicker } from "@/components/home/SportsTicker";
import { LiveBadge } from "@/components/live/LiveBadge";
import type { LiveSummaryPayload } from "@/lib/live/types";
import { cn } from "@/lib/utils";

const POLL_MS = 45_000;
const ACTIVITY_ROTATE_MS = 6_500;

async function fetchSummary(): Promise<LiveSummaryPayload | null> {
  try {
    const res = await fetch("/api/live/summary", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as LiveSummaryPayload;
  } catch {
    return null;
  }
}

export function GlobalLiveBar() {
  const [data, setData] = useState<LiveSummaryPayload | null>(null);
  const [activityIdx, setActivityIdx] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden")
      return;
    const next = await fetchSummary();
    if (next) setData(next);
  }, []);

  useEffect(() => {
    void load();
    pollRef.current = setInterval(() => void load(), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const activity = useMemo(() => data?.activity ?? [], [data]);
  useEffect(() => {
    if (activity.length <= 1) return;
    actRef.current = setInterval(() => {
      setActivityIdx((i) => (i + 1) % activity.length);
    }, ACTIVITY_ROTATE_MS);
    return () => {
      if (actRef.current) clearInterval(actRef.current);
    };
  }, [activity.length]);

  useEffect(() => {
    setActivityIdx(0);
  }, [data?.updatedAt]);

  const activityText = useMemo(() => {
    if (activity.length === 0) return "Carregando sinal ao vivo…";
    return activity[activityIdx % activity.length]?.text ?? "";
  }, [activity, activityIdx]);

  const oddLabel =
    data?.counts.oddMediaAtivos != null
      ? `@ média ${data.counts.oddMediaAtivos.toFixed(2)}`
      : "—";

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-16 z-40 border-b border-amber-500/15",
        "bg-zinc-950/94 backdrop-blur-md shadow-[0_10px_36px_-22px_rgba(0,0,0,0.85)]",
      )}
    >
      <div className="container-site flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2">
          <LiveBadge variant="live" />
          <span className="hidden h-3 w-px bg-white/12 sm:block" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium tabular-nums text-zinc-300">
          <span className="text-emerald-200/95">
            G <strong className="text-emerald-100">{data?.counts.greens ?? "—"}</strong>
          </span>
          <span className="text-rose-200/90">
            R <strong className="text-rose-100">{data?.counts.reds ?? "—"}</strong>
          </span>
          <span className="hidden text-zinc-500 sm:inline" aria-hidden>
            ·
          </span>
          <span className="text-zinc-400">{oddLabel}</span>
          <span className="hidden text-zinc-500 sm:inline" aria-hidden>
            ·
          </span>
          <span className="text-amber-200/90">
            {data?.counts.ativos ?? "—"} ao vivo
          </span>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-[min(42vw,28rem)]">
          <p
            className="truncate text-[10px] text-zinc-500 sm:text-[11px]"
            title={activityText}
          >
            <span className="font-semibold text-zinc-400">Última atividade · </span>
            {activityText}
          </p>
        </div>

        <Link
          href="/live"
          className="ml-auto shrink-0 rounded-lg border border-gold-400/25 bg-gold-400/[0.06] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200/95 transition hover:border-gold-300/40 hover:bg-gold-400/10"
        >
          Centro live
        </Link>
      </div>

      {data && data.tickerItems.length > 0 ? (
        <SportsTicker
          items={data.tickerItems}
          variant="slim"
          className="border-t border-amber-500/12 border-b-0"
        />
      ) : (
        <div
          className="h-10 border-t border-amber-500/10 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950"
          aria-hidden
        >
          <div className="container-site flex h-full items-center">
            <div className="h-2 w-1/3 max-w-md animate-pulse rounded-full bg-zinc-700/35" />
          </div>
        </div>
      )}
    </div>
  );
}
