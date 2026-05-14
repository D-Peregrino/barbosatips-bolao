import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { QuickPickRow, QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";

const COLUNAS =
  "id,esporte,campeonato,jogo,mercado,odd,confianca,justificativa,horario_jogo,status,resultado,is_premium,created_at" as const;

function normalizarStatus(raw: unknown): QuickPickStatus {
  return String(raw ?? "").toLowerCase().trim() === "encerrado"
    ? "encerrado"
    : "ativo";
}

function normalizarResultado(raw: unknown): QuickPickResultado {
  const s = String(raw ?? "").toLowerCase().trim();
  if (s === "green") return "green";
  if (s === "red") return "red";
  if (s === "void") return "void";
  if (s === "pendente") return "pendente";
  return "pendente";
}

function mapRow(r: Record<string, unknown>): QuickPickRow {
  const oddRaw = r.odd;
  const odd =
    typeof oddRaw === "number"
      ? oddRaw
      : parseFloat(String(oddRaw ?? "0").replace(",", ".")) || 0;

  const prem = r.is_premium;
  const isPremium =
    prem === true ||
    prem === "true" ||
    String(prem ?? "").toLowerCase() === "t";

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
    is_premium: isPremium,
    created_at: String(r.created_at ?? ""),
  };
}

/** `soGratis`: exclui premium para utilizador logado sem assinatura. */
export async function listarQuickPicks(soGratis = false): Promise<QuickPickRow[]> {
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

    const rows = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    if (!soGratis) return rows;
    return rows.filter((p) => !p.is_premium);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function listarQuickPicksPremium(limit: number): Promise<QuickPickRow[]> {
  if (shouldSkipLiveSupabase() || limit <= 0) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS)
      .eq("is_premium", true)
      .order("horario_jogo", { ascending: false })
      .limit(Math.min(limit * 3, 120));

    if (error) {
      console.error("quick_picks listarPremium", error);
      return [];
    }

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>)).slice(0, limit);
  } catch (e) {
    console.error(e);
    return [];
  }
}
