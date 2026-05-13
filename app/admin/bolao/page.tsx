import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { AdminBolaoPanel } from "@/components/admin/bolao/AdminBolaoPanel";
import type { BolaoResultadoOficialRow } from "@/app/admin/bolao/actions";
import { mergeJogosComOverrides } from "@/lib/admin/bolao-jogos-merged";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";
import { COPA2026_JOGOS } from "@/lib/mocks/copa2026-groupstage.mock";

export const metadata: Metadata = {
  title: "Admin Bolão · Copa 2026",
  description: "Painel administrativo do bolão BarbosaTips.",
};

export const dynamic = "force-dynamic";

function supabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    undefined
  );
}

/** Converte `jogo_id` do Supabase para o mesmo formato de `jogo.id` do mock (ex.: caixa diferente). */
function canonicalJogoIdParaAdmin(
  raw: string,
  idsOficiais: Set<string>,
  idPorLower: Map<string, string>,
): string | null {
  const t = raw.trim();
  if (idsOficiais.has(t)) return t;
  const porCaixa = idPorLower.get(t.toLowerCase());
  return porCaixa ?? null;
}

function rowParaResultadoOficial(
  row: Record<string, unknown>,
  jogoIdCanonico: string,
): BolaoResultadoOficialRow | null {
  const casa = Number(row.placar_casa_real);
  const fora = Number(row.placar_fora_real);
  if (!Number.isInteger(casa) || !Number.isInteger(fora)) return null;
  if (casa < 0 || casa > 99 || fora < 0 || fora > 99) return null;
  const st = row.status;
  return {
    jogo_id: jogoIdCanonico,
    placar_casa_real: casa,
    placar_fora_real: fora,
    status:
      st === undefined || st === null ? undefined : String(st).trim() || undefined,
  };
}

/**
 * Carrega resultados no SSR com o mesmo critério do painel: service role + sessão admin.
 * Logs no terminal do servidor (Node) ao renderizar `/admin/bolao`.
 */
async function carregarResultadosIniciaisAdmin(): Promise<
  BolaoResultadoOficialRow[]
> {
  const secret = adminBolaoSessionSecret();
  const token = cookies().get(ADMIN_BOLAO_COOKIE)?.value;
  if (!secret || !(await verifyAdminBolaoCookieValue(token, secret))) {
    return [];
  }

  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return [];
  }

  console.log("CARREGANDO RESULTADOS SALVOS");

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .schema("public")
    .from("bolao_resultados_teste")
    .select("*");

  if (error) {
    console.error("ERRO CARREGAR RESULTADOS", error);
    return [];
  }

  console.log("RESULTADOS SALVOS SUPABASE", data);

  const rows = (data ?? []) as Record<string, unknown>[];
  const normalizedRows = rows.map((r) => ({
    ...r,
    jogo_id: String(r.jogo_id ?? "").trim(),
  }));

  const resultadosPorJogo = Object.fromEntries(
    normalizedRows.map((r) => [r.jogo_id, r]),
  );

  const jogos = mergeJogosComOverrides([]);
  if (jogos[0]) {
    console.log("PRIMEIRO JOGO ID", jogos[0].id);
  }
  console.log("IDS RESULTADOS", normalizedRows.map((r) => r.jogo_id));

  const comMatchIdExato = jogos.filter(
    (j) => resultadosPorJogo[j.id] != null,
  ).length;
  console.log(
    "JOGO RESULTADO MAPA (ids exatos jogo.id ↔ chave mapa)",
    comMatchIdExato,
    "de",
    jogos.length,
  );

  const idsOficiais = new Set(COPA2026_JOGOS.map((j) => j.id));
  const idPorLower = new Map(
    COPA2026_JOGOS.map((j) => [j.id.toLowerCase(), j.id] as const),
  );

  const initialResultados: BolaoResultadoOficialRow[] = [];
  for (const row of normalizedRows) {
    const rawId = row.jogo_id;
    const canon = canonicalJogoIdParaAdmin(rawId, idsOficiais, idPorLower);
    if (!canon) {
      continue;
    }
    const parsed = rowParaResultadoOficial(row, canon);
    if (parsed) initialResultados.push(parsed);
  }

  if (normalizedRows.length > 0 && initialResultados.length < normalizedRows.length) {
    console.log(
      "AVISO IDS: algumas linhas em bolao_resultados_teste não batem com jogo.id do calendário (após trim/caixa). Verifique jogo_id no banco.",
    );
  }

  return initialResultados;
}

export default async function AdminBolaoPage() {
  const initialResultados = await carregarResultadosIniciaisAdmin();

  return <AdminBolaoPanel initialResultados={initialResultados} />;
}
