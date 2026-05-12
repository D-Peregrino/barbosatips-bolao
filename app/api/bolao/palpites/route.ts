import { NextResponse } from "next/server";
import { salvarPalpitesBolao } from "@/app/bolao/palpites/actions";

type PlacaresBody = Record<string, { casa: string; fora: string }>;

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
  const jogoId = String(o.jogoId ?? "").trim();
  const placares = o.placares;

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

  if (!placares || typeof placares !== "object" || Array.isArray(placares)) {
    return NextResponse.json(
      { ok: false as const, error: "Placares inválidos." },
      { status: 400 },
    );
  }

  const placaresNorm: PlacaresBody = {};
  for (const [k, v] of Object.entries(placares as Record<string, unknown>)) {
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const pv = v as Record<string, unknown>;
    placaresNorm[k] = {
      casa: String(pv.casa ?? ""),
      fora: String(pv.fora ?? ""),
    };
  }

  const result = await salvarPalpitesBolao(email, placaresNorm, {
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
}
