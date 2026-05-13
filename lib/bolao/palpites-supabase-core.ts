import {
  type PostgrestError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  COPA2026_JOGOS,
  COPA2026_JOGO_IDS,
  copa2026PalpitesAbertosParaJogo,
} from "@/lib/mocks/copa2026-groupstage.mock";
import {
  MSG_PALPITES_ENCERRADOS_JOGO,
  type SalvarPalpitesBolaoResult,
  type VerificarPalpitesBolaoResult,
} from "@/app/bolao/palpites/utils";

const MSG_EMAIL_NAO_INSCRITO = "E-mail não inscrito no bolão.";
const MSG_PLACAR_INCOMPLETO =
  "Informe o placar do mandante e do visitante antes de salvar.";

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

function placaresVazios(): Record<string, { casa: string; fora: string }> {
  return Object.fromEntries(COPA2026_JOGOS.map((j) => [j.id, { casa: "", fora: "" }]));
}

function palpitePersistidoInicialPorJogo(): Record<string, boolean> {
  return Object.fromEntries(COPA2026_JOGOS.map((j) => [j.id, false]));
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

function mensagemErroPostgrest(err: PostgrestError): string {
  const partes = [err.message, err.details, err.hint].filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  return partes.join(" — ") || "Erro no Supabase.";
}

async function salvarOuAtualizarPalpite(
  admin: SupabaseClient,
  inscricaoId: string,
  jogoId: string,
  placar_casa: number,
  placar_fora: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existente, error: errSel } = await admin
    .from("palpites_bolao")
    .select("id")
    .eq("inscricao_id", inscricaoId)
    .eq("jogo_id", jogoId)
    .maybeSingle();

  if (errSel) {
    console.error("ERRO SUPABASE", errSel);
    return { ok: false, error: mensagemErroPostgrest(errSel) };
  }

  const idExistente = existente?.id as string | undefined;

  if (idExistente) {
    const { error: errUp } = await admin
      .from("palpites_bolao")
      .update({ placar_casa, placar_fora })
      .eq("id", idExistente);
    if (errUp) {
      console.error("ERRO SUPABASE", errUp);
      return { ok: false, error: mensagemErroPostgrest(errUp) };
    }
    return { ok: true };
  }

  const { error: errIns } = await admin.from("palpites_bolao").insert({
    inscricao_id: inscricaoId,
    jogo_id: jogoId,
    placar_casa,
    placar_fora,
  });

  if (!errIns) return { ok: true };

  console.error("ERRO SUPABASE", errIns);

  if (String(errIns.code) === "23505") {
    const { data: row2, error: errSel2 } = await admin
      .from("palpites_bolao")
      .select("id")
      .eq("inscricao_id", inscricaoId)
      .eq("jogo_id", jogoId)
      .maybeSingle();
    if (errSel2) {
      console.error("ERRO SUPABASE", errSel2);
      return { ok: false, error: mensagemErroPostgrest(errSel2) };
    }
    const id2 = row2?.id as string | undefined;
    if (id2) {
      const { error: errUp2 } = await admin
        .from("palpites_bolao")
        .update({ placar_casa, placar_fora })
        .eq("id", id2);
      if (errUp2) {
        console.error("ERRO SUPABASE", errUp2);
        return { ok: false, error: mensagemErroPostgrest(errUp2) };
      }
      return { ok: true };
    }
  }

  return { ok: false, error: mensagemErroPostgrest(errIns) };
}

async function validarInscricaoIdParaEmail(
  admin: SupabaseClient,
  inscricaoId: string,
  emailNorm: string,
): Promise<
  | { ok: true; id: string; palpites_confirmados_at: string | null }
  | { ok: false; error: string }
> {
  const idTrim = inscricaoId.trim();
  if (!idTrim) {
    return { ok: false, error: "Identificador da inscrição ausente." };
  }

  const { data: insc, error: errInsc } = await admin
    .from("inscricoes_bolao")
    .select("id, email, palpites_confirmados_at")
    .eq("id", idTrim)
    .maybeSingle();

  if (errInsc) {
    console.error("ERRO SUPABASE", errInsc);
    return {
      ok: false,
      error: mensagemErroPostgrest(errInsc),
    };
  }
  if (!insc?.id) {
    return { ok: false, error: MSG_EMAIL_NAO_INSCRITO };
  }

  const emailInsc = normalizarEmail(String((insc as { email?: unknown }).email ?? ""));
  if (emailInsc !== emailNorm) {
    return {
      ok: false,
      error: "Sessão inválida para este participante. Faça login novamente.",
    };
  }

  return {
    ok: true,
    id: String(insc.id),
    palpites_confirmados_at: (insc as { palpites_confirmados_at?: string | null })
      .palpites_confirmados_at ?? null,
  };
}

export async function verificarECarregarPalpitesBolaoWithClient(
  admin: SupabaseClient,
  email: string,
  inscricaoId: string,
): Promise<VerificarPalpitesBolaoResult> {
  const emailNorm = normalizarEmail(email);
  if (!emailNorm || !emailNorm.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  try {
    const inscRes = await validarInscricaoIdParaEmail(admin, inscricaoId, emailNorm);
    if (!inscRes.ok) {
      return { ok: false, error: inscRes.error };
    }

    const { data: rows, error: errPal } = await admin
      .from("palpites_bolao")
      .select("jogo_id, placar_casa, placar_fora")
      .eq("inscricao_id", inscRes.id);

    if (errPal) {
      console.error("ERRO SUPABASE", errPal);
      return { ok: false, error: mensagemErroPostgrest(errPal) };
    }

    const placares = placaresVazios();
    const palpitePersistidoPorJogo = palpitePersistidoInicialPorJogo();

    for (const row of rows ?? []) {
      const jid = String(row.jogo_id ?? "");
      if (!COPA2026_JOGO_IDS.has(jid)) continue;
      palpitePersistidoPorJogo[jid] = true;
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
      confirmado: Boolean(inscRes.palpites_confirmados_at),
      palpitePersistidoPorJogo,
    };
  } catch (e) {
    console.error("ERRO SUPABASE", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao conectar ao banco." };
  }
}

export async function salvarPalpitesBolaoWithClient(
  admin: SupabaseClient,
  email: string,
  inscricaoId: string,
  placares: Record<string, { casa: string; fora: string }>,
  options?: { confirmar?: boolean; apenasJogoId?: string },
): Promise<SalvarPalpitesBolaoResult> {
  const emailNorm = normalizarEmail(email);
  if (!emailNorm || !emailNorm.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  const confirmar = Boolean(options?.confirmar);
  const apenasJogoId = options?.apenasJogoId?.trim();

  if (!confirmar && apenasJogoId) {
    if (!COPA2026_JOGO_IDS.has(apenasJogoId)) {
      return { ok: false, error: `Identificador de jogo inválido: ${apenasJogoId}` };
    }
  } else {
    const keyErr = assertPlacaresKeys(placares);
    if (keyErr) return { ok: false, error: keyErr };
  }

  try {
    const inscRes = await validarInscricaoIdParaEmail(admin, inscricaoId, emailNorm);
    if (!inscRes.ok) {
      return { ok: false, error: inscRes.error };
    }

    if (inscRes.palpites_confirmados_at) {
      return {
        ok: false,
        error: "Os palpites já foram confirmados e não podem mais ser alterados.",
      };
    }

    const idInscricao = inscRes.id;

    if (!confirmar && apenasJogoId) {
      if (!copa2026PalpitesAbertosParaJogo(apenasJogoId)) {
        return { ok: false, error: MSG_PALPITES_ENCERRADOS_JOGO };
      }

      const p = placares[apenasJogoId] ?? { casa: "", fora: "" };
      const c = parsePlacarInt(p.casa ?? "");
      const f = parsePlacarInt(p.fora ?? "");

      if (c === null && f === null) {
        const { error: delErr } = await admin
          .from("palpites_bolao")
          .delete()
          .eq("inscricao_id", idInscricao)
          .eq("jogo_id", apenasJogoId);
        if (delErr) {
          console.error("ERRO SUPABASE", delErr);
          return { ok: false, error: mensagemErroPostgrest(delErr) };
        }
        return { ok: true };
      }

      if (c === null || f === null) {
        return { ok: false, error: MSG_PLACAR_INCOMPLETO };
      }

      const r = await salvarOuAtualizarPalpite(admin, idInscricao, apenasJogoId, c, f);
      if (!r.ok) return r;
      return { ok: true };
    }

    for (const jogo of COPA2026_JOGOS) {
      const aberto = copa2026PalpitesAbertosParaJogo(jogo.id);
      const p = placares[jogo.id] ?? { casa: "", fora: "" };
      const c = parsePlacarInt(p.casa ?? "");
      const f = parsePlacarInt(p.fora ?? "");

      if (!aberto) {
        if (c !== null || f !== null) {
          return { ok: false, error: MSG_PALPITES_ENCERRADOS_JOGO };
        }
        continue;
      }

      if (c === null && f === null) {
        const { error: delErr } = await admin
          .from("palpites_bolao")
          .delete()
          .eq("inscricao_id", idInscricao)
          .eq("jogo_id", jogo.id);
        if (delErr) {
          console.error("ERRO SUPABASE", delErr);
          return { ok: false, error: mensagemErroPostgrest(delErr) };
        }
        continue;
      }

      if (c === null || f === null) {
        return { ok: false, error: MSG_PLACAR_INCOMPLETO };
      }

      const r = await salvarOuAtualizarPalpite(admin, idInscricao, jogo.id, c, f);
      if (!r.ok) return r;
    }

    if (confirmar) {
      const { error: confErr } = await admin
        .from("inscricoes_bolao")
        .update({ palpites_confirmados_at: new Date().toISOString() })
        .eq("id", idInscricao);
      if (confErr) {
        console.error("ERRO SUPABASE", confErr);
        return { ok: false, error: mensagemErroPostgrest(confErr) };
      }
    }

    return { ok: true };
  } catch (e) {
    console.error("ERRO SUPABASE", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || "Falha ao salvar." };
  }
}
