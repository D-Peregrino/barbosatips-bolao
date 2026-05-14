import { listarAnalisesPublicadas } from "@/lib/analises/queries";
import type { AnaliseRow } from "@/lib/analises/types";
import { listLeadsForAdmin } from "@/lib/leads/actions";
import type { LeadRow } from "@/lib/leads/types";
import { listarQuickPicksPerformance } from "@/lib/picks/queries";
import type { QuickPickRow } from "@/lib/picks/types";

export type AnalyticsPagePayload = {
  picks: QuickPickRow[];
  leads: LeadRow[];
  analises: AnaliseRow[];
};

export async function loadAnalyticsPagePayload(): Promise<AnalyticsPagePayload> {
  const [picks, leads, analises] = await Promise.all([
    listarQuickPicksPerformance(),
    listLeadsForAdmin(),
    listarAnalisesPublicadas(false),
  ]);
  return { picks, leads, analises };
}
