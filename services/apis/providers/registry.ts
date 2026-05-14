import type { SportsDataProvider } from "@/services/apis/contracts";
import type { SportsProviderId } from "@/services/apis/types";
import { MockSportsDataProvider } from "@/services/apis/providers/mock-provider";

const instances = new Map<SportsProviderId, SportsDataProvider>();

/**
 * Resolve o fornecedor de dados desportivos.
 * Todos os IDs usam o mock até existirem adaptadores reais; o `id` separa instâncias e chaves de cache.
 */
export function getSportsDataProvider(id: SportsProviderId = "mock"): SportsDataProvider {
  let p = instances.get(id);
  if (!p) {
    p = new MockSportsDataProvider(id);
    instances.set(id, p);
  }
  return p;
}
