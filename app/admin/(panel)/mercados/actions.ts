"use server";

import { revalidatePath } from "next/cache";
import { buildMarketBoard } from "@/lib/betting/build-market-board";
import { saveMarketEvSnapshots } from "@/lib/betting/market-ev-snapshots";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export type SaveSnapshotActionResult =
  | {
      ok: true;
      inserted: number;
      skipped: number;
      savedAt: string;
      snapshotDate: string;
    }
  | { ok: false; error: string };

export async function saveMarketEvSnapshotAction(): Promise<SaveSnapshotActionResult> {
  const gate = await requireAdminActor();
  if (!gate.ok) return { ok: false, error: gate.error };

  const board = await buildMarketBoard();
  if (!board.ok) {
    return { ok: false, error: board.error };
  }

  const result = await saveMarketEvSnapshots(board.rows);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/mercados");
  revalidatePath("/admin/mercados/historico");
  revalidatePath("/admin/mercados/resultados");

  return {
    ok: true,
    inserted: result.inserted,
    skipped: result.skipped,
    savedAt: result.savedAt,
    snapshotDate: result.snapshotDate,
  };
}
