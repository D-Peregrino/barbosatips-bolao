"use server";

import { createClient } from "@supabase/supabase-js";
import { COPA2026_JOGO_IDS } from "@/lib/mocks/copa2026-groupstage.mock";

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

export async function salvarResultadoTesteBolao(input: {
  jogoId: string;
  placarCasaReal: number;
  placarForaReal: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
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

  const { error } = await admin.from("bolao_resultados_teste").upsert(
    {
      jogo_id: jogoId,
      placar_casa_real: placarCasaReal,
      placar_fora_real: placarForaReal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "jogo_id" },
  );

  if (error) {
    return { ok: false, error: error.message || "Falha ao gravar resultado." };
  }

  return { ok: true };
}
