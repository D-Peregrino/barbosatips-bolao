"use server";

import { createClient } from "@supabase/supabase-js";
import {
  salvarPalpitesBolaoWithClient,
  verificarECarregarPalpitesBolaoWithClient,
} from "@/lib/bolao/palpites-supabase-core";
import {
  type SalvarPalpitesBolaoResult,
  type VerificarPalpitesBolaoResult,
} from "@/app/bolao/palpites/utils";

const MSG_VARIAVEIS = "Variáveis do Supabase não configuradas.";

function supabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    undefined
  );
}

function createBolaoServiceClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verificarECarregarPalpitesBolao(
  email: string,
  inscricaoId: string,
): Promise<VerificarPalpitesBolaoResult> {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: MSG_VARIAVEIS };
  }

  const admin = createBolaoServiceClient();
  if (!admin) {
    return { ok: false, error: MSG_VARIAVEIS };
  }

  return verificarECarregarPalpitesBolaoWithClient(admin, email, inscricaoId);
}

export async function salvarPalpitesBolao(
  email: string,
  inscricaoId: string,
  placares: Record<string, { casa: string; fora: string }>,
  options?: { confirmar?: boolean; apenasJogoId?: string },
): Promise<SalvarPalpitesBolaoResult> {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: MSG_VARIAVEIS };
  }

  const admin = createBolaoServiceClient();
  if (!admin) {
    return { ok: false, error: MSG_VARIAVEIS };
  }

  return salvarPalpitesBolaoWithClient(admin, email, inscricaoId, placares, options);
}
