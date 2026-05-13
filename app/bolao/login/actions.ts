"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

const MSG_EMAIL_NAO_ENCONTRADO = "E-mail não encontrado no bolão";
const MSG_SENHA_INCORRETA = "Senha incorreta";

export type LoginBolaoResult =
  | { ok: true; inscricao_id: string; nome: string; email: string; pago: boolean }
  | { ok: false; error: string };

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createBolaoServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Login simples (sem Supabase Auth): valida e-mail em inscricoes_bolao e senha === e-mail normalizado.
 */
export async function loginBolaoParticipante(
  email: string,
  senha: string,
): Promise<LoginBolaoResult> {
  const emailNorm = normalizarEmail(email);
  const senhaNorm = normalizarEmail(senha);

  if (!emailNorm || !emailNorm.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (!senhaNorm) {
    return { ok: false, error: "Informe a senha." };
  }

  if (shouldSkipLiveSupabase()) {
    if (senhaNorm !== emailNorm) {
      return { ok: false, error: MSG_SENHA_INCORRETA };
    }
    const apelido = emailNorm.split("@")[0] || "Participante";
    return {
      ok: true,
      inscricao_id: randomUUID(),
      nome: apelido,
      email: emailNorm,
      /** Modo mock: libera palpites sem depender do painel admin. */
      pago: true,
    };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { ok: false, error: "Servidor sem SUPABASE_SERVICE_ROLE_KEY configurada." };
  }

  const admin = createBolaoServiceClient();
  if (!admin) {
    return { ok: false, error: "Servidor sem credenciais Supabase (URL ou service role)." };
  }

  try {
    const { data: row, error } = await admin
      .from("inscricoes_bolao")
      .select("id, nome, email, pago")
      .eq("email", emailNorm)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      return { ok: false, error: error.message || "Erro ao consultar inscrição." };
    }

    if (!row?.email || !row.id) {
      return { ok: false, error: MSG_EMAIL_NAO_ENCONTRADO };
    }

    if (senhaNorm !== emailNorm) {
      return { ok: false, error: MSG_SENHA_INCORRETA };
    }

    const nome = String(row.nome ?? "").trim() || emailNorm.split("@")[0] || "Participante";
    const pago = (row as { pago?: unknown }).pago === true;
    return {
      ok: true,
      inscricao_id: String(row.id),
      nome,
      email: String(row.email).trim().toLowerCase(),
      pago,
    };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao conectar." };
  }
}
