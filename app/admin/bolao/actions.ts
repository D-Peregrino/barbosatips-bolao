"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { COPA2026_JOGO_IDS } from "@/lib/mocks/copa2026-groupstage.mock";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";

function supabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    undefined
  );
}

function createServiceClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function guardAdminBolao(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const secret = adminBolaoSessionSecret();
  if (!secret) {
    return {
      ok: false,
      error: "Sessão admin não configurada (ADMIN_BOLAO_PASSWORD).",
    };
  }
  const token = cookies().get(ADMIN_BOLAO_COOKIE)?.value;
  if (!(await verifyAdminBolaoCookieValue(token, secret))) {
    return { ok: false, error: "Sessão inválida ou expirada." };
  }
  return { ok: true };
}

export async function salvarResultadoOficialBolao(input: {
  jogoId: string;
  placarCasaReal: number;
  placarForaReal: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await guardAdminBolao();
  if (!g.ok) return g;

  const jogoId = String(input.jogoId ?? "").trim();
  const placarCasaReal = input.placarCasaReal;
  const placarForaReal = input.placarForaReal;

  if (!jogoId || !COPA2026_JOGO_IDS.has(jogoId)) {
    return { ok: false, error: "Identificador de jogo inválido." };
  }
  for (const n of [placarCasaReal, placarForaReal]) {
    if (!Number.isInteger(n) || n < 0 || n > 99) {
      return { ok: false, error: "Cada placar deve ser um inteiro entre 0 e 99." };
    }
  }

  const admin = createServiceClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "Servidor sem credenciais Supabase (URL ou SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const payload = {
    jogo_id: jogoId,
    placar_casa_real: placarCasaReal,
    placar_fora_real: placarForaReal,
    status: "finalizado" as const,
    updated_at: new Date().toISOString(),
  };

  console.log("SALVANDO RESULTADO", payload);

  const { error } = await admin
    .from("bolao_resultados_teste")
    .upsert(payload, { onConflict: "jogo_id" });

  if (error) {
    console.error("ERRO AO SALVAR RESULTADO", error);
    return {
      ok: false,
      error: error.message || "Falha ao gravar resultado no Supabase.",
    };
  }

  return { ok: true };
}

/** Alias compatível com código legado / referências. */
export async function salvarResultadoTesteBolao(
  input: Parameters<typeof salvarResultadoOficialBolao>[0],
): Promise<{ ok: true } | { ok: false; error: string }> {
  return salvarResultadoOficialBolao(input);
}

export async function salvarJogoOverrideAdmin(input: {
  jogoId: string;
  dataIso: string | null;
  horario: string | null;
  statusManual: string | null;
  inicioPartidaIso: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await guardAdminBolao();
  if (!g.ok) return g;

  const jogoId = String(input.jogoId ?? "").trim();
  if (!jogoId || !COPA2026_JOGO_IDS.has(jogoId)) {
    return { ok: false, error: "Identificador de jogo inválido." };
  }

  const st = input.statusManual?.trim() || null;
  if (
    st !== null &&
    st !== "aberto" &&
    st !== "quase" &&
    st !== "encerrado"
  ) {
    return { ok: false, error: "Status inválido (use aberto, quase ou encerrado)." };
  }

  const admin = createServiceClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "Servidor sem credenciais Supabase (URL ou SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const row = {
    jogo_id: jogoId,
    data_iso: input.dataIso?.trim() || null,
    horario: input.horario?.trim() || null,
    status_manual: st,
    inicio_partida_iso: input.inicioPartidaIso?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("bolao_jogo_admin_override")
    .upsert(row, { onConflict: "jogo_id" });

  if (error) {
    return { ok: false, error: error.message || "Falha ao salvar jogo." };
  }

  return { ok: true };
}
