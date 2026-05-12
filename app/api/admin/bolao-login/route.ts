import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const esperada = process.env.ADMIN_PASSWORD?.trim();
  if (!esperada) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD não está definida no servidor (.env ou variáveis de ambiente).",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const senha =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (senha !== esperada) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
