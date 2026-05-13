"use server";

import { createClient } from "@supabase/supabase-js";
import { isSupabaseMock } from "@/lib/supabase/is-mock";

export type InscreverBolaoResult =
  | { ok: true }
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
 * Inscrição pública no bolão Copa 2026 — grava em `public.inscricoes_bolao`.
 */
export async function inscreverBolaoCopa2026(
  nome: string,
  email: string,
): Promise<InscreverBolaoResult> {
  const nomeLimpo = nome.trim();
  const emailNorm = normalizarEmail(email);

  if (!nomeLimpo || nomeLimpo.length < 2) {
    return { ok: false, error: "Informe seu nome (pelo menos 2 caracteres)." };
  }
  if (!emailNorm || !emailNorm.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  if (isSupabaseMock()) {
    return { ok: true };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      ok: false,
      error: "Inscrições indisponíveis: configure SUPABASE_SERVICE_ROLE_KEY no servidor.",
    };
  }

  const admin = createBolaoServiceClient();
  if (!admin) {
    return { ok: false, error: "Servidor sem credenciais Supabase configuradas." };
  }

  try {
    const { data: duplicada, error: errDup } = await admin
      .from("inscricoes_bolao")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();

    if (errDup) {
      console.error(errDup);
      return { ok: false, error: errDup.message || "Erro ao verificar inscrição." };
    }
    if (duplicada?.id) {
      return {
        ok: false,
        error: "Este e-mail já está inscrito no bolão. Use Entrar para acessar.",
      };
    }

    const { error: errIns } = await admin.from("inscricoes_bolao").insert({
      nome: nomeLimpo,
      email: emailNorm,
      status_pagamento: "pendente",
      valor_pago: 0,
    });

    if (errIns) {
      console.error(errIns);
      if (String(errIns.code) === "23505") {
        return {
          ok: false,
          error: "Este e-mail já está inscrito no bolão. Use Entrar para acessar.",
        };
      }
      return {
        ok: false,
        error: errIns.message || "Não foi possível concluir a inscrição.",
      };
    }

    return { ok: true };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao conectar." };
  }
}
