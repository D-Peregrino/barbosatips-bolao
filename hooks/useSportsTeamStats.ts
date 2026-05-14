"use client";

import { useCallback } from "react";
import { getSportsDataProvider } from "@/services/apis/providers/registry";
import { useSportsAsync } from "@/hooks/useSportsAsync";
import type { SportDomain, SportsProviderId, TeamStatsDTO } from "@/services/apis/types";

export function useSportsTeamStats(
  sport: SportDomain,
  teamId: string | null,
  opts?: { providerId?: SportsProviderId; enabled?: boolean },
) {
  const providerId = opts?.providerId ?? "mock";
  const enabled = (opts?.enabled ?? true) && Boolean(teamId);

  const fetcher = useCallback(() => {
    const provider = getSportsDataProvider(providerId);
    return provider.getTeamStats({ sport, teamId: teamId! });
  }, [providerId, sport, teamId]);

  return useSportsAsync<TeamStatsDTO | null>(fetcher, [sport, teamId, providerId], { enabled });
}
