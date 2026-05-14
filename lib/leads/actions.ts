"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { leadSubmitSchema, normalizeEmail } from "@/lib/leads/schema";
import type { LeadRow } from "@/lib/leads/types";

export type SubmitLeadResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitLeadAction(input: unknown): Promise<SubmitLeadResult> {
  const parsed = leadSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Verifica o email e o esporte seleccionado." };
  }
  if (parsed.data.company?.trim()) {
    return { ok: true, message: "Obrigado." };
  }

  if (shouldSkipLiveSupabase()) {
    return { ok: false, message: "Inscrições temporariamente indisponíveis." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, message: "Serviço indisponível. Tenta mais tarde." };
  }

  const normalized = normalizeEmail(parsed.data.email);
  const row = {
    email: parsed.data.email.trim(),
    email_normalized: normalized,
    name: parsed.data.name?.trim() || null,
    favorite_sport: parsed.data.favorite_sport,
    want_picks: Boolean(parsed.data.want_picks),
    want_greens: Boolean(parsed.data.want_greens),
    want_premium_analises: Boolean(parsed.data.want_premium_analises),
    want_live_alerts: Boolean(parsed.data.want_live_alerts),
    source: parsed.data.source,
  };

  const { error } = await admin.from("leads").upsert(row, {
    onConflict: "email_normalized",
  });

  if (error) {
    console.error("submitLeadAction", error);
    return { ok: false, message: "Não foi possível guardar. Tenta de novo." };
  }

  return { ok: true, message: "Inscrição registada. Bem-vindo à comunidade BarbosaTips." };
}

export async function listLeadsForAdmin(): Promise<LeadRow[]> {
  if (shouldSkipLiveSupabase()) return [];
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return [];
  }
  const { data, error } = await admin
    .from("leads")
    .select(
      "id,email,email_normalized,name,favorite_sport,want_picks,want_greens,want_premium_analises,want_live_alerts,source,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(400);

  if (error) {
    console.error("listLeadsForAdmin", error);
    return [];
  }
  return (data ?? []) as LeadRow[];
}
