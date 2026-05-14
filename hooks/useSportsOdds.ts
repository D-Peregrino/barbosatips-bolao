"use client";

import { useCallback } from "react";
import { getSportsDataProvider } from "@/services/apis/providers/registry";
import { useSportsAsync } from "@/hooks/useSportsAsync";
import type { OddsSnapshotDTO, SportDomain, SportsProviderId } from "@/services/apis/types";

export function useSportsOdds(
  sport: SportDomain,
  fixtureId: string | null,
  opts?: { providerId?: SportsProviderId; enabled?: boolean },
) {
  const providerId = opts?.providerId ?? "mock";
  const enabled = (opts?.enabled ?? true) && Boolean(fixtureId);

  const fetcher = useCallback(() => {
    const provider = getSportsDataProvider(providerId);
    return provider.getOdds({ sport, fixtureId: fixtureId! });
  }, [providerId, sport, fixtureId]);

  return useSportsAsync<OddsSnapshotDTO | null>(fetcher, [sport, fixtureId, providerId], { enabled });
}
