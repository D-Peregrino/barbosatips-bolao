import type { AnaliseRow } from "@/lib/analises/types";
import { listarUltimasAnalisesPublicadas } from "@/lib/analises/queries";
import type { PublicTipsterProfile } from "@/config/tipsters";
import { getPublicTipster } from "@/config/tipsters";
import { listarQuickPicksPerformance } from "@/lib/picks/queries";
import type { QuickPickRow } from "@/lib/picks/types";
import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import { buildHomePerformanceSnapshot } from "@/lib/home/home-performance";
import {
  aggregateByEsporte,
  aggregateByMercado,
  aggregateMonthlyPerformance,
  buildCumulativeUnitsSeries,
  recentPicksHistory,
  type MarketAgg,
  type MonthPerformance,
  type RoiSeriesPoint,
  type SportAgg,
} from "@/lib/tipsters/aggregate-picks";

export type TipsterPageModel = {
  profile: PublicTipsterProfile;
  picks: QuickPickRow[];
  snapshot: ReturnType<typeof buildHomePerformanceSnapshot>;
  roiSeries: RoiSeriesPoint[];
  monthly: MonthPerformance[];
  bestMarkets: MarketAgg[];
  bestSports: SportAgg[];
  lastPicks: QuickPickRow[];
  historyPicks: QuickPickRow[];
  lastAnalises: AnaliseRow[];
};

export async function loadTipsterPageData(
  slug: string,
  opts?: { analisesLimit?: number },
): Promise<TipsterPageModel | null> {
  const profile = getPublicTipster(slug);
  if (!profile) return null;

  let picks: QuickPickRow[] = [];
  if (profile.picksScope === "portal") {
    picks = await listarQuickPicksPerformance();
  }
  /** Futuro: `by_slug` com `.eq('tipster_slug', profile.slug)` */

  const snapshot = buildHomePerformanceSnapshot(picks);
  const roiSeries = buildCumulativeUnitsSeries(picks);
  const monthly = aggregateMonthlyPerformance(picks);
  const bestMarkets = aggregateByMercado(picks, 2);
  const bestSports = aggregateByEsporte(picks, rotuloEsporte, 2);
  const lastPicks = [...picks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);
  const historyPicks = recentPicksHistory(picks, 18);

  const n = opts?.analisesLimit ?? 8;
  const lastAnalises = await listarUltimasAnalisesPublicadas(n, false);

  return {
    profile,
    picks,
    snapshot,
    roiSeries,
    monthly,
    bestMarkets,
    bestSports,
    lastPicks,
    historyPicks,
    lastAnalises,
  };
}
