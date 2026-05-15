"use server";

import { revalidatePath } from "next/cache";
import { refreshMarketEvResultsFromApi } from "@/lib/betting/market-ev-results";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export type RefreshResultsActionResult =
  | {
      ok: true;
      processed: number;
      settled: number;
      skipped: number;
      errors: string[];
    }
  | { ok: false; error: string };

export async function refreshMarketEvResultsAction(): Promise<RefreshResultsActionResult> {
  const gate = await requireAdminActor();
  if (!gate.ok) return { ok: false, error: gate.error };

  const result = await refreshMarketEvResultsFromApi();
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/mercados/resultados");
  revalidatePath("/admin/mercados/historico");
  revalidatePath("/admin/mercados");

  return result;
}
