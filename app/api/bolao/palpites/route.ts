import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { salvarPalpitesBolaoWithClient } from "@/lib/bolao/palpites-supabase-core";

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

  console.log("API PALPITES RECEBEU", body);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false as const, error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const o = body as Record<string, unknown>;
  const email = String(o.email ?? "").trim();
  const jogoId = String(o.jogo_id ?? o.jogoId ?? "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false as const, error: "Informe um e-mail válido." },
      { status: 400 },
    );
  }

  if (!jogoId) {
    return NextResponse.json(
      { ok: false as const, error: "Identificador do jogo ausente." },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
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

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const result = await salvarPalpitesBolaoWithClient(client, email, placaresNorm, {
      confirmar: false,
      apenasJogoId: jogoId,
    });

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
