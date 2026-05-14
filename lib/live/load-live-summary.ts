import type { AnaliseRow } from "@/lib/analises/types";
import { listarUltimasAnalisesPublicadas } from "@/lib/analises/queries";
import { buildLiveSummaryPayload } from "@/lib/live/build-live-summary";
import type { LiveSummaryPayload } from "@/lib/live/types";
import { getPremiumAccess } from "@/lib/premium/get-premium-access";
import {
  filtroListagemSoGratis,
  viewerPodeVerPremium,
} from "@/lib/premium/types";
import type { QuickPickRow } from "@/lib/picks/types";
import { listarQuickPicksRecentes } from "@/lib/picks/queries";

export type LiveViewerBundle = {
  summary: LiveSummaryPayload;
  viewerCanViewPremium: boolean;
  picks: QuickPickRow[];
  analises: AnaliseRow[];
};

/** Dados do centro live + picks brutas (listagem) — mesmo critério da home/API. */
export async function loadLiveSummaryForViewer(): Promise<LiveViewerBundle> {
  const access = await getPremiumAccess();
  const soGratis = filtroListagemSoGratis(access);
  const [picks, analises] = await Promise.all([
    listarQuickPicksRecentes(120, soGratis),
    listarUltimasAnalisesPublicadas(12, soGratis),
  ]);
  return {
    summary: buildLiveSummaryPayload(picks, analises),
    viewerCanViewPremium: viewerPodeVerPremium(access),
    picks,
    analises,
  };
}
