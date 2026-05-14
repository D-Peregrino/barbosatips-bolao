"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFollow } from "@/actions/engagement";
import type { FollowKind } from "@/lib/engagement/types";
import {
  clearEngagementSnapshotCache,
  isFollowing,
  readEngagementSnapshot,
} from "@/lib/engagement/client-snapshot";

type Props = {
  kind: FollowKind;
  refKey: string;
  className?: string;
  label?: string;
  /** Texto curto ao lado do ícone (desktop). */
  showLabel?: boolean;
};

export function FollowToggleButton({ kind, refKey, className, label, showLabel }: Props) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    readEngagementSnapshot()
      .then((snap) => {
        if (cancelled) return;
        if (!snap.userId) {
          setReady(true);
          setOn(false);
          return;
        }
        setOn(isFollowing(snap, kind, refKey));
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, [kind, refKey]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startTransition(async () => {
        const res = await toggleFollow(kind, refKey);
        if (!res.ok) {
          if (res.error === "auth" && typeof window !== "undefined") {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
          return;
        }
        setOn(res.following);
        clearEngagementSnapshotCache();
      });
    },
    [kind, refKey],
  );

  const title = on ? "Deixar de seguir" : "Seguir para o meu feed";

  return (
    <button
      type="button"
      title={title}
      aria-label={label ?? title}
      aria-pressed={on}
      disabled={pending || !ready}
      onClick={onClick}
      className={cn(
        "pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide transition duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950",
        on
          ? "border-gold-400/45 bg-gold-400/15 text-gold-100 shadow-[0_0_28px_-10px_rgba(201,162,39,0.45)]"
          : "border-white/10 bg-black/45 text-zinc-400 hover:border-gold-400/30 hover:text-gold-200",
        pending && "opacity-60",
        className,
      )}
    >
      {on ? <BellRing className="h-4 w-4" aria-hidden /> : <Bell className="h-4 w-4" aria-hidden />}
      {showLabel ? <span>{on ? "A seguir" : "Seguir"}</span> : null}
    </button>
  );
}
