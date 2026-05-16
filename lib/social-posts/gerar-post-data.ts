import type { AnaliseRow } from "@/lib/analises/types";
import type { PerformancePeriodStats } from "@/lib/picks/performance-periods";
import type { QuickPickRow } from "@/lib/picks/types";
import type { SocialLinks } from "@/lib/social-posts/types";

/** Dados serializados para o painel cliente «Gerar Post». */
export type GerarPostPageData = {
  picks: QuickPickRow[];
  analises: AnaliseRow[];
  perf7d: PerformancePeriodStats;
  perf30d: PerformancePeriodStats;
  links: SocialLinks;
};
