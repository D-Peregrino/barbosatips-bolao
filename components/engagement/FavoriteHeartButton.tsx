"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/actions/engagement";
import type { FavoriteKind } from "@/lib/engagement/types";
import {
  clearEngagementSnapshotCache,
  isAnaliseFavorited,
  isPickFavorited,
  readEngagementSnapshot,
} from "@/lib/engagement/client-snapshot";

type Props = {
  kind: FavoriteKind;
  refId: string;
  className?: string;
  label?: string;
};

export function FavoriteHeartButton({ kind, refId, className, label }: Props) {
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
        const v =
          kind === "analise" ? isAnaliseFavorited(snap, refId) : isPickFavorited(snap, refId);
        setOn(v);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, [kind, refId]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startTransition(async () => {
        const res = await toggleFavorite(kind, refId);
        if (!res.ok) {
          if (res.error === "auth" && typeof window !== "undefined") {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
          return;
        }
        setOn(res.favorited);
        clearEngagementSnapshotCache();
      });
    },
    [kind, refId],
  );

  const title = on ? "Remover dos favoritos" : "Guardar nos favoritos";

  return (
    <button
      type="button"
      title={title}
      aria-label={label ?? title}
      aria-pressed={on}
      disabled={pending || !ready}
      onClick={onClick}
      className={cn(
        "pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border transition duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950",
        on
          ? "border-rose-500/40 bg-rose-500/15 text-rose-200 shadow-[0_0_24px_-8px_rgba(251,113,133,0.35)]"
          : "border-white/10 bg-black/50 text-zinc-400 hover:border-gold-400/35 hover:bg-gold-400/10 hover:text-gold-200",
        pending && "opacity-60",
        className,
      )}
    >
      <Heart
        className={cn("h-[18px] w-[18px] transition duration-300", on && "scale-105 fill-current")}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
