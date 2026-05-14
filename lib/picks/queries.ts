import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { QuickPickRow, QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";

const COLUNAS =
  "id,esporte,campeonato,jogo,mercado,odd,confianca,justificativa,horario_jogo,status,resultado,created_at" as const;

function normalizarStatus(raw: unknown): QuickPickStatus {
  return String(raw ?? "").toLowerCase().trim() === "encerrado"
    ? "encerrado"
    : "ativo";
}

function normalizarResultado(raw: unknown): QuickPickResultado {
  const s = String(raw ?? "").toLowerCase().trim();
  if (s === "green") return "green";
  if (s === "red") return "red";
  return null;
}

function mapRow(r: Record<string, unknown>): QuickPickRow {
  const oddRaw = r.odd;
  const odd =
    typeof oddRaw === "number"
      ? oddRaw
      : parseFloat(String(oddRaw ?? "0").replace(",", ".")) || 0;

  return {
    id: String(r.id ?? ""),
    esporte: String(r.esporte ?? "").trim() || "futebol",
    campeonato: String(r.campeonato ?? ""),
    jogo: String(r.jogo ?? ""),
    mercado: String(r.mercado ?? ""),
    odd,
    confianca: Math.min(
      100,
      Math.max(0, Number.parseInt(String(r.confianca ?? "0"), 10) || 0),
    ),
    justificativa: String(r.justificativa ?? ""),
    horario_jogo: String(r.horario_jogo ?? ""),
    status: normalizarStatus(r.status),
    resultado: normalizarResultado(r.resultado),
    created_at: String(r.created_at ?? ""),
  };
}

export async function listarQuickPicks(): Promise<QuickPickRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS)
      .order("horario_jogo", { ascending: false })
      .limit(500);

    if (error) {
      console.error("quick_picks listar", error);
      return [];
    }

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  } catch (e) {
    console.error(e);
    return [];
  }
}
