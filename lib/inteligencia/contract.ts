/**
 * Contratos futuros (REST / edge functions) — implementação real fora deste bundle.
 *
 * Planeado:
 * - `GET /api/inteligencia/snapshot?sport=&fixtureId=` → `InteligenciaSnapshot` validado (Zod).
 * - Worker de ingestão: odds closing, shots, tracking (Impect / StatsBomb / provedor NBA).
 * - Camada ML: calibração Platt + ensemble de mercados; explicabilidade SHAP resumida em `insights`.
 * - IA: sumários em PT gerados a partir do snapshot (nunca substituir números sem validação humana).
 *
 * Variáveis sugeridas:
 * - `INTEL_ODDS_PROVIDER` — identificador do agregador.
 * - `INTEL_MODEL_ENDPOINT` — URL interna do serviço de scoring.
 */

import type { InteligenciaSnapshot, SportId } from "./types";

export type SnapshotRequest = {
  sport: SportId;
  fixtureId?: string;
  /** ISO competition id quando existir catálogo real */
  competition?: string;
};

/** Assinatura para serviço remoto ou edge function que hidrate o dashboard. */
export type LoadInteligenciaSnapshot = (
  input: SnapshotRequest,
) => Promise<InteligenciaSnapshot>;
