"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { parseHorarioJogoBrasilia } from "@/lib/picks/parse-horario";
import type { QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";

export type SalvarQuickPickResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const RESULTADOS: QuickPickResultado[] = [
  "pendente",
  "green",
  "red",
  "void",
];
const STATUS: QuickPickStatus[] = ["ativo", "encerrado"];

function parseOdd(formData: FormData): number {
  const n = parseFloat(String(formData.get("odd") ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseConfianca(formData: FormData): number {
  const c = parseInt(String(formData.get("confianca") ?? "").trim(), 10);
  if (!Number.isFinite(c)) return 50;
  return Math.min(100, Math.max(0, c));
}

function parseResultado(raw: string): QuickPickResultado | null {
  const s = raw.toLowerCase().trim();
  return RESULTADOS.includes(s as QuickPickResultado)
    ? (s as QuickPickResultado)
    : null;
}

function parseStatus(raw: string): QuickPickStatus | null {
  const s = raw.toLowerCase().trim();
  return STATUS.includes(s as QuickPickStatus) ? (s as QuickPickStatus) : null;
}

/** Regras: ao vivo → só pendente; green/red/void → sempre encerrado. */
function normalizarEstadoGuardado(
  status: QuickPickStatus,
  resultado: QuickPickResultado,
): { status: QuickPickStatus; resultado: QuickPickResultado } {
  if (status === "ativo") {
    return { status: "ativo", resultado: "pendente" };
  }
  if (resultado === "green" || resultado === "red" || resultado === "void") {
    return { status: "encerrado", resultado };
  }
  return { status: "encerrado", resultado };
}

export async function criarQuickPickAction(
  _prev: SalvarQuickPickResult | undefined,
  formData: FormData,
): Promise<SalvarQuickPickResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const esporte = String(formData.get("esporte") ?? "").trim() || "futebol";
  const campeonato = String(formData.get("campeonato") ?? "").trim();
  const jogo = String(formData.get("jogo") ?? "").trim();
  const mercado = String(formData.get("mercado") ?? "").trim();
  const justificativa = String(formData.get("justificativa") ?? "").trim();
  const horarioRaw = String(formData.get("horario_jogo") ?? "").trim();

  if (!jogo) return { ok: false, error: "Jogo é obrigatório." };
  if (!mercado) return { ok: false, error: "Mercado é obrigatório." };
  if (!horarioRaw) return { ok: false, error: "Horário do jogo é obrigatório." };

  const horario = parseHorarioJogoBrasilia(horarioRaw);
  if (Number.isNaN(horario.getTime())) {
    return { ok: false, error: "Horário do jogo inválido." };
  }

  const odd = parseOdd(formData);
  if (odd < 1.01) {
    return { ok: false, error: "Odd deve ser pelo menos 1,01." };
  }

  const confianca = parseConfianca(formData);
  const isPremium = String(formData.get("is_premium") ?? "") === "1";

  const admin = createAdminClient();
  const { error } = await admin.from("quick_picks").insert({
    esporte,
    campeonato,
    jogo,
    mercado,
    odd,
    confianca,
    justificativa,
    horario_jogo: horario.toISOString(),
    status: "ativo",
    resultado: "pendente",
    is_premium: isPremium,
  });

  if (error) {
    console.error("criarQuickPick", error);
    return { ok: false, error: error.message || "Erro ao gravar pick." };
  }

  revalidatePath("/picks");
  revalidatePath("/admin-picks");
  revalidatePath("/premium");
  revalidatePath("/");
  return { ok: true, message: "Pick publicada." };
}

export async function guardarEstadoQuickPickAction(
  _prev: SalvarQuickPickResult | undefined,
  formData: FormData,
): Promise<SalvarQuickPickResult> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, error: "Supabase não configurado neste ambiente." };
  }

  const id = String(formData.get("pick_id") ?? "").trim();
  const statusIn = parseStatus(String(formData.get("status") ?? ""));
  const resultadoIn = parseResultado(String(formData.get("resultado") ?? ""));

  if (!id) return { ok: false, error: "Pick inválida." };
  if (!statusIn) return { ok: false, error: "Estado inválido." };
  if (!resultadoIn) return { ok: false, error: "Resultado inválido." };

  const { status, resultado } = normalizarEstadoGuardado(statusIn, resultadoIn);

  const admin = createAdminClient();
  const { error } = await admin
    .from("quick_picks")
    .update({ status, resultado })
    .eq("id", id);

  if (error) {
    console.error("guardarEstadoQuickPick", error);
    return { ok: false, error: error.message || "Erro ao guardar." };
  }

  revalidatePath("/picks");
  revalidatePath("/admin-picks");
  revalidatePath("/premium");
  revalidatePath("/");
  return { ok: true, message: "Estado atualizado." };
}
