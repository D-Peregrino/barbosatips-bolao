"use client";

import { getEngagementSnapshot } from "@/actions/engagement";

type Snap = Awaited<ReturnType<typeof getEngagementSnapshot>>;

let cache: Snap | null = null;
let inflight: Promise<Snap> | null = null;

export async function readEngagementSnapshot(): Promise<Snap> {
  if (cache) return cache;
  if (!inflight) {
    inflight = getEngagementSnapshot().then((c) => {
      cache = c;
      inflight = null;
      return c;
    });
  }
  return inflight;
}

export function clearEngagementSnapshotCache() {
  cache = null;
}

export function isAnaliseFavorited(snap: Snap, slug: string): boolean {
  return snap.favoriteSlugs.includes(slug);
}

export function isPickFavorited(snap: Snap, id: string): boolean {
  return snap.favoritePickIds.includes(id);
}

export function isFollowing(snap: Snap, kind: string, refKey: string): boolean {
  const k = refKey.trim().toLowerCase();
  return snap.followKeys.some((f) => f.kind === kind && f.ref_key.trim().toLowerCase() === k);
}
