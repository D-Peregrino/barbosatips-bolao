import { listarTodasAnalisesAdmin } from "@/lib/analises/admin-queries";
import {
  computePerformancePeriodStats,
} from "@/lib/picks/performance-periods";
import { listarQuickPicksPerformance } from "@/lib/picks/queries";
import { buildSocialLinks } from "@/lib/social-posts/format";
import type { GerarPostPageData } from "@/lib/social-posts/gerar-post-data";

export type { GerarPostPageData } from "@/lib/social-posts/gerar-post-data";

export async function loadGerarPostPageData(): Promise<GerarPostPageData> {
  const [picks, todasAnalises] = await Promise.all([
    listarQuickPicksPerformance(),
    listarTodasAnalisesAdmin(),
  ]);

  const analises = todasAnalises.filter((a) => a.status === "publicado");
  const links = buildSocialLinks();

  return {
    picks,
    analises,
    perf7d: computePerformancePeriodStats(picks, "7d"),
    perf30d: computePerformancePeriodStats(picks, "30d"),
    links,
  };
}
