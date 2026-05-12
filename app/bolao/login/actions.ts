"use server";

import { createClient } from "@supabase/supabase-js";
import { isSupabaseMock } from "@/lib/supabase/is-mock";

const MSG_EMAIL_NAO_ENCONTRADO = "E-mail não encontrado no bolão";
const MSG_SENHA_INCORRETA = "Senha incorreta";

export type LoginBolaoResult =
  | { ok: true; nome: string; email: string }
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

  if (isSupabaseMock()) {
    if (senhaNorm !== emailNorm) {
      return { ok: false, error: MSG_SENHA_INCORRETA };
    }
    const apelido = emailNorm.split("@")[0] || "Participante";
    return { ok: true, nome: apelido, email: emailNorm };
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
      .select("nome, email")
      .eq("email", emailNorm)
      .maybeSingle();

    if (error) {
      console.error(error);
      return { ok: false, error: error.message || "Erro ao consultar inscrição." };
    }

    if (!row?.email) {
      return { ok: false, error: MSG_EMAIL_NAO_ENCONTRADO };
    }

    if (senhaNorm !== emailNorm) {
      return { ok: false, error: MSG_SENHA_INCORRETA };
    }

    const nome = String(row.nome ?? "").trim() || emailNorm.split("@")[0] || "Participante";
    return { ok: true, nome, email: String(row.email).trim().toLowerCase() };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao conectar." };
  }
}
