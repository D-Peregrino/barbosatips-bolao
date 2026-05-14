/**
 * Ponto de extensão para integração futura com APIs esportivas (odds, xG, lineups).
 * O CMS grava `stat_blocks` em JSONB; um worker ou server action pode:
 * 1. Buscar dados do fornecedor
 * 2. Validar com `statBlocksPayloadSchema` (em `parse.ts`)
 * 3. Fazer `update` na linha `analises` com o array normalizado
 */
export type SportsDataProviderId = "manual" | "custom_http";

export type StatBlocksHydrationContext = {
  analiseId: string;
  slug: string;
  esporte: string;
  timeCasa: string;
  timeFora: string;
  provider: SportsDataProviderId;
};
