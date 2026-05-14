"use client";

import { useCallback } from "react";
import { getSportsDataProvider } from "@/services/apis/providers/registry";
import { useSportsAsync } from "@/hooks/useSportsAsync";
import type { LiveEventDTO, SportDomain, SportsProviderId } from "@/services/apis/types";

export function useSportsLiveEvents(
  sport: SportDomain,
  opts?: { providerId?: SportsProviderId; enabled?: boolean },
) {
  const providerId = opts?.providerId ?? "mock";
  const enabled = opts?.enabled ?? true;

  const fetcher = useCallback(() => {
    const provider = getSportsDataProvider(providerId);
    return provider.listLiveEvents({ sport });
  }, [providerId, sport]);

  return useSportsAsync<LiveEventDTO[]>(fetcher, [sport, providerId], { enabled });
}
