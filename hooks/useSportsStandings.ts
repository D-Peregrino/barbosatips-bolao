"use client";

import { useCallback } from "react";
import { getSportsDataProvider } from "@/services/apis/providers/registry";
import { useSportsAsync } from "@/hooks/useSportsAsync";
import type { SportDomain, SportsProviderId, StandingsDTO } from "@/services/apis/types";

export function useSportsStandings(
  sport: SportDomain,
  opts?: { providerId?: SportsProviderId; competicaoId?: string; enabled?: boolean },
) {
  const providerId = opts?.providerId ?? "mock";
  const competicaoId = opts?.competicaoId;
  const enabled = opts?.enabled ?? true;

  const fetcher = useCallback(() => {
    const provider = getSportsDataProvider(providerId);
    return provider.getStandings({ sport, competicaoId });
  }, [providerId, sport, competicaoId]);

  return useSportsAsync<StandingsDTO | null>(fetcher, [sport, competicaoId, providerId], { enabled });
}
