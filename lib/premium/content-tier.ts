import type { AnaliseRow } from "@/lib/analises/types";
import type { QuickPickRow } from "@/lib/picks/types";

/**
 * Níveis editoriais (sem cobrança ainda).
 * - `public`: listagem e leitura integral gratuitas.
 * - `premium`: conteúdo reservado a assinantes (`is_premium` no Supabase).
 * - `exclusive`: subseto premium, marcado por tags (evita migração DB imediata).
 */
export type ContentTier = "public" | "premium" | "exclusive";

const EXCLUSIVE_TAG = /\b(vip-exclusivo|vip_exclusivo|exclusivo|exclusive)\b/i;

/** Marca exclusivo via tags/categorias da análise (premium continua obrigatório). */
export function analiseIsExclusiveMarker(analise: Pick<AnaliseRow, "tags" | "categoria">): boolean {
  const blob = `${analise.tags ?? ""} ${analise.categoria ?? ""}`;
  return EXCLUSIVE_TAG.test(blob);
}

export function analiseContentTier(analise: AnaliseRow): ContentTier {
  if (!analise.is_premium) return "public";
  if (analiseIsExclusiveMarker(analise)) return "exclusive";
  return "premium";
}

/** Picks: exclusivo opcional via marcador na justificativa (admin). */
export function pickIsExclusiveMarker(pick: Pick<QuickPickRow, "justificativa">): boolean {
  return EXCLUSIVE_TAG.test(pick.justificativa ?? "");
}

export function pickContentTier(pick: QuickPickRow): ContentTier {
  if (!pick.is_premium) return "public";
  if (pickIsExclusiveMarker(pick)) return "exclusive";
  return "premium";
}

export function tierRequiresSubscription(tier: ContentTier): boolean {
  return tier === "premium" || tier === "exclusive";
}
