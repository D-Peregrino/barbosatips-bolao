import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MSG_PALPITES_ENCERRADOS_JOGO } from "@/app/bolao/palpites/utils";
import { salvarPalpitesBolaoWithClient } from "@/lib/bolao/palpites-supabase-core";
import {
  COPA2026_DEV_PALPITE_BLOQUEIO_ID,
  copa2026DevPalpiteBloqueioAtivo,
  copa2026PalpitesAbertosParaJogo,
} from "@/lib/mocks/copa2026-groupstage.mock";

type PlacaresBody = Record<string, { casa: string; fora: string }>;

const MSG_VARIAVEIS = "Variáveis do Supabase não configuradas.";

function strPlacar(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    const n = Math.trunc(v);
    if (n < 0 || n > 99) return "";
    return String(n);
  }
  return String(v).replace(/\D/g, "").slice(0, 2);
}

function createBolaoServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false as const, error: "JSON inválido no corpo da requisição." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false as const, error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const o = body as Record<string, unknown>;
  const email = String(o.email ?? "").trim();
  const inscricaoId = String(o.inscricao_id ?? o.inscricaoId ?? "").trim();
  const jogoId = String(o.jogo_id ?? o.jogoId ?? "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false as const, error: "Informe um e-mail válido." },
      { status: 400 },
    );
  }

  if (!inscricaoId) {
    return NextResponse.json(
      { ok: false as const, error: "Identificador da inscrição ausente." },
      { status: 400 },
    );
  }

  if (!jogoId) {
    return NextResponse.json(
      { ok: false as const, error: "Identificador do jogo ausente." },
      { status: 400 },
    );
  }

  if (
    copa2026DevPalpiteBloqueioAtivo() &&
    jogoId === COPA2026_DEV_PALPITE_BLOQUEIO_ID
  ) {
    return NextResponse.json(
      {
        ok: false as const,
        error: "Jogo de simulação local — não é persistido no banco.",
      },
      { status: 400 },
    );
  }

  /** Bloqueio por calendário (início oficial − 15 min), espelhando o mock Copa 2026. */
  if (!copa2026PalpitesAbertosParaJogo(jogoId)) {
    return NextResponse.json(
      { ok: false as const, error: MSG_PALPITES_ENCERRADOS_JOGO },
      { status: 403 },
    );
  }

  const admin = createBolaoServiceClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false as const, error: MSG_VARIAVEIS },
      { status: 400 },
    );
  }

  const placaresNorm: PlacaresBody = {
    [jogoId]: {
      casa: strPlacar(o.placar_casa),
      fora: strPlacar(o.placar_fora),
    },
  };

  try {
    const result = await salvarPalpitesBolaoWithClient(
      admin,
      email,
      inscricaoId,
      placaresNorm,
      {
        confirmar: false,
        apenasJogoId: jogoId,
      },
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false as const, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true as const });
  } catch (error) {
    console.error("ERRO SUPABASE", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false as const, error: msg || "Falha ao salvar." },
      { status: 500 },
    );
  }
}
