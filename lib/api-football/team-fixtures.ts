import { getApiFootballKey } from "@/lib/api-football/client";
import type { ApiFootballRawFixture } from "@/lib/api-football/types";

const API_BASE = "https://v3.football.api-sports.io";

/** Últimos jogos finalizados de uma equipa (para tendências no market board). */
export async function fetchTeamLastFixtures(
  teamId: number,
  last = 5,
): Promise<ApiFootballRawFixture[]> {
  const apiKey = getApiFootballKey();
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `${API_BASE}/fixtures?team=${teamId}&last=${last}`,
      {
        headers: { "x-apisports-key": apiKey },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as {
      errors?: Record<string, string>;
      response?: ApiFootballRawFixture[];
    };
    if (body.errors && Object.keys(body.errors).length > 0) return [];
    return body.response ?? [];
  } catch {
    return [];
  }
}
