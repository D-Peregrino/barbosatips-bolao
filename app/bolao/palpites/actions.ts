"use server";

import {
  COPA2026_JOGOS,
  COPA2026_JOGO_IDS,
} from "@/lib/mocks/copa2026-groupstage.mock";
import { isSupabaseMock } from "@/lib/supabase/is-mock";
import { createAdminClient } from "@/lib/supabase/server";

export type VerificarPalpitesBolaoResult =
  | {
      ok: true;
      placares: Record<string, { casa: string; fora: string }>;
      confirmado: boolean;
    }
  | { ok: false; error: string };

export type SalvarPalpitesBolaoResult = { ok: true } | { ok: false; error: string };

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

function placaresVazios(): Record<string, { casa: string; fora: string }> {
  return Object.fromEntries(COPA2026_JOGOS.map((j) => [j.id, { casa: "", fora: "" }]));
}

function parsePlacarInt(valor: string): number | null {
  const limpo = valor.replace(/\D/g, "").slice(0, 2);
  if (!limpo) return null;
  const n = parseInt(limpo, 10);
  if (!Number.isFinite(n) || n < 0 || n > 99) return null;
  return n;
}

function assertPlacaresKeys(
  placares: Record<string, { casa: string; fora: string }>,
): string | null {
  for (const key of Object.keys(placares)) {
    if (!COPA2026_JOGO_IDS.has(key)) {
      return `Identificador de jogo inválido: ${key}`;
    }
  }
  return null;
}

export async function verificarECarregarPalpitesBolao(
  email: string,
): Promise<VerificarPalpitesBolaoResult> {
  if (isSupabaseMock()) {
    return { ok: false, error: "Supabase em modo demonstração. Use o fluxo local nesta página." };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { ok: false, error: "Servidor sem SUPABASE_SERVICE_ROLE_KEY configurada." };
  }

  const emailNorm = normalizarEmail(email);
  if (!emailNorm || !emailNorm.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  try {
    const admin = createAdminClient();

    const { data: insc, error: errInsc } = await admin
      .from("inscricoes_bolao")
      .select("id, palpites_confirmados_at")
      .eq("email", emailNorm)
      .maybeSingle();

    if (errInsc) {
      return { ok: false, error: errInsc.message || "Erro ao consultar inscrição." };
    }
    if (!insc?.id) {
      return {
        ok: false,
        error: "Este e-mail não está cadastrado no bolão. Use o mesmo e-mail da inscrição.",
      };
    }

    const { data: rows, error: errPal } = await admin
      .from("palpites_bolao")
      .select("jogo_id, placar_casa, placar_fora")
      .eq("inscricao_id", insc.id);

    if (errPal) {
      return { ok: false, error: errPal.message || "Erro ao carregar palpites." };
    }

    const placares = placaresVazios();
    for (const row of rows ?? []) {
      const jid = String(row.jogo_id ?? "");
      if (!COPA2026_JOGO_IDS.has(jid)) continue;
      const c = row.placar_casa;
      const f = row.placar_fora;
      placares[jid] = {
        casa: c != null && c !== "" ? String(c) : "",
        fora: f != null && f !== "" ? String(f) : "",
      };
    }

    return {
      ok: true,
      placares,
      confirmado: Boolean(insc.palpites_confirmados_at),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao conectar ao banco." };
  }
}

export async function salvarPalpitesBolao(
  email: string,
  placares: Record<string, { casa: string; fora: string }>,
  options?: { confirmar?: boolean },
): Promise<SalvarPalpitesBolaoResult> {
  if (isSupabaseMock()) {
    return { ok: false, error: "Supabase em modo demonstração." };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { ok: false, error: "Servidor sem SUPABASE_SERVICE_ROLE_KEY configurada." };
  }

  const emailNorm = normalizarEmail(email);
  if (!emailNorm || !emailNorm.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  const keyErr = assertPlacaresKeys(placares);
  if (keyErr) return { ok: false, error: keyErr };

  const confirmar = Boolean(options?.confirmar);

  try {
    const admin = createAdminClient();

    const { data: insc, error: errInsc } = await admin
      .from("inscricoes_bolao")
      .select("id, palpites_confirmados_at")
      .eq("email", emailNorm)
      .maybeSingle();

    if (errInsc) {
      return { ok: false, error: errInsc.message || "Erro ao consultar inscrição." };
    }
    if (!insc?.id) {
      return {
        ok: false,
        error: "Este e-mail não está cadastrado no bolão.",
      };
    }

    if (insc.palpites_confirmados_at) {
      return { ok: false, error: "Os palpites já foram confirmados e não podem mais ser alterados." };
    }

    const inscricaoId = insc.id as string;

    const upsertRows: {
      inscricao_id: string;
      jogo_id: string;
      placar_casa: number | null;
      placar_fora: number | null;
    }[] = [];

    for (const jogo of COPA2026_JOGOS) {
      const p = placares[jogo.id] ?? { casa: "", fora: "" };
      const c = parsePlacarInt(p.casa ?? "");
      const f = parsePlacarInt(p.fora ?? "");

      if (c === null && f === null) {
        const { error: delErr } = await admin
          .from("palpites_bolao")
          .delete()
          .eq("inscricao_id", inscricaoId)
          .eq("jogo_id", jogo.id);
        if (delErr) {
          return { ok: false, error: delErr.message || "Erro ao limpar palpite." };
        }
        continue;
      }

      upsertRows.push({
        inscricao_id: inscricaoId,
        jogo_id: jogo.id,
        placar_casa: c,
        placar_fora: f,
      });
    }

    if (upsertRows.length > 0) {
      const { error: upErr } = await admin.from("palpites_bolao").upsert(upsertRows, {
        onConflict: "inscricao_id,jogo_id",
      });
      if (upErr) {
        return { ok: false, error: upErr.message || "Erro ao salvar palpites." };
      }
    }

    if (confirmar) {
      const { error: confErr } = await admin
        .from("inscricoes_bolao")
        .update({ palpites_confirmados_at: new Date().toISOString() })
        .eq("id", inscricaoId);
      if (confErr) {
        return { ok: false, error: confErr.message || "Erro ao confirmar palpites." };
      }
    }

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao salvar." };
  }
}
