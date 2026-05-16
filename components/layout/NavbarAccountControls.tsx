"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { readEngagementSnapshot, clearEngagementSnapshotCache } from "@/lib/engagement/client-snapshot";
import { usePathname } from "next/navigation";

export function NavbarAccountControls() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    clearEngagementSnapshotCache();
    readEngagementSnapshot()
      .then((s) => setUnread(s.unreadNotifications ?? 0))
      .catch(() => setUnread(0));
  }, [user, pathname]);

  if (loading || !user) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/meu-feed"
        className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-gold-200/95 transition hover:bg-white/[0.06] hover:text-gold-100"
      >
        Meu feed
      </Link>
      <Link
        href="/meu-feed?tab=notifs"
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-gold-400/35 hover:text-gold-200",
        )}
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-md">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
