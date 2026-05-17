import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { QuickPickRow, QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";
import { textoMatchesLiga } from "@/lib/sport-routes";

const COLUNAS =
  "id,esporte,campeonato,jogo,mercado,odd,confianca,justificativa,horario_jogo,status,resultado,created_at" as const;

const COLUNAS_SITEMAP = "id,horario_jogo,created_at" as const;

export type QuickPickSitemapEntry = { id: string; lastModified: Date };

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

/** Picks recentes com limite controlado (home, destaques) — mais leve que listarQuickPicks(500). `soGratis` exclui premium. */
export async function listarQuickPicksRecentes(
  limit: number,
  soGratis = false,
): Promise<QuickPickRow[]> {
  if (shouldSkipLiveSupabase() || limit <= 0) return [];
  const cap = Math.min(Math.max(limit, 1), 200);
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS)
      .order("horario_jogo", { ascending: false })
      .limit(cap);

    if (error) {
      console.error("quick_picks recentes", error);
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
  return [];
}

const PERF_LIMIT = 2500;

/**
 * Todas as quick_picks (até cap) para o dashboard público de performance.
 * Inclui premium — estatísticas agregadas, sem paywall de conteúdo editorial.
 */
export async function listarQuickPicksPerformance(): Promise<QuickPickRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS)
      .order("horario_jogo", { ascending: false })
      .limit(PERF_LIMIT);

    if (error) {
      console.error("quick_picks performance", error);
      return [];
    }

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Picks rápidas por esporte (índice Supabase em `esporte`).
 */
export async function listarQuickPicksPorEsporte(
  esporteSlug: string,
  soGratis = false,
): Promise<QuickPickRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  const slug = String(esporteSlug ?? "").trim().toLowerCase();
  if (!slug) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS)
      .eq("esporte", slug)
      .order("horario_jogo", { ascending: false })
      .limit(500);

    if (error) {
      console.error("quick_picks por esporte", error);
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

export async function listarQuickPicksPorEsporteELiga(
  esporteSlug: string,
  leagueSlug: string,
  leagueLabel: string,
  soGratis = false,
): Promise<QuickPickRow[]> {
  const base = await listarQuickPicksPorEsporte(esporteSlug, soGratis);
  return base.filter((p) =>
    textoMatchesLiga(p.campeonato, leagueSlug, leagueLabel),
  );
}

const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizePickIdQuery(raw: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

/** Entradas para sitemap (`/pick/[id]`) — só leitura, sem alterar Supabase. */
export async function listarQuickPicksParaSitemap(limit = 500): Promise<QuickPickSitemapEntry[]> {
  if (shouldSkipLiveSupabase() || limit <= 0) return [];
  const cap = Math.min(Math.max(limit, 1), 2000);
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS_SITEMAP)
      .order("horario_jogo", { ascending: false })
      .limit(cap);

    if (error) {
      console.error("quick_picks sitemap", error);
      return [];
    }

    return (data ?? [])
      .map((row) => {
        const r = row as Record<string, unknown>;
        const id = String(r.id ?? "");
        const hora = String(r.horario_jogo ?? "");
        const created = String(r.created_at ?? "");
        const raw = hora || created;
        const d = new Date(raw);
        const lastModified = Number.isFinite(d.getTime()) ? d : new Date();
        return { id, lastModified };
      })
      .filter((x) => UUID_LIKE.test(x.id));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function obterQuickPickPorId(rawId: string): Promise<QuickPickRow | null> {
  const id = normalizePickIdQuery(rawId);
  if (!id || !UUID_LIKE.test(id)) return null;
  if (shouldSkipLiveSupabase()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("quick_picks").select(COLUNAS).eq("id", id).maybeSingle();

    if (error) {
      console.error("quick_picks obterPorId", error);
      return null;
    }
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch (e) {
    console.error(e);
    return null;
  }
}

/** Picks por ids (favoritos / meu feed). */
export async function listarQuickPicksPorIds(
  ids: string[],
  soGratis = false,
): Promise<QuickPickRow[]> {
  const uniq = Array.from(new Set(ids.map((s) => String(s ?? "").trim().toLowerCase()).filter(Boolean)));
  if (shouldSkipLiveSupabase() || uniq.length === 0) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quick_picks")
      .select(COLUNAS)
      .in("id", uniq)
      .order("horario_jogo", { ascending: false });

    if (error) {
      console.error("quick_picks por ids", error);
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
