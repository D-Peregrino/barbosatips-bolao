"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSportsDataProvider } from "@/services/apis/providers/registry";
import { useSportsAsync } from "@/hooks/useSportsAsync";
import type { FixtureDTO, SportDomain, SportsProviderId } from "@/services/apis/types";

export function useSportsFixtures(
  sport: SportDomain,
  opts?: { providerId?: SportsProviderId; limit?: number; enabled?: boolean },
) {
  const providerId = opts?.providerId ?? "mock";
  const limit = opts?.limit ?? 10;
  const enabled = opts?.enabled ?? true;

  const fetcher = useCallback(() => {
    const provider = getSportsDataProvider(providerId);
    return provider.listFixtures({ sport, limit });
  }, [providerId, sport, limit]);

  return useSportsAsync<FixtureDTO[]>(fetcher, [sport, limit, providerId], { enabled });
}
