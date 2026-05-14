import { buildMockSnapshot } from "@/lib/inteligencia/mock-snapshot";
import type { InteligenciaSnapshot, SportId } from "@/lib/inteligencia/types";

export async function getInteligenciaSnapshot(sport: SportId): Promise<InteligenciaSnapshot> {
  return buildMockSnapshot(sport);
}
