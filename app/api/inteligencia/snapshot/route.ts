import { NextResponse } from "next/server";
import { getInteligenciaSnapshot } from "@/lib/inteligencia/get-snapshot";
import type { SportId } from "@/lib/inteligencia/types";

export const dynamic = "force-dynamic";

function parseSport(raw: string | null): SportId {
  if (raw === "tennis" || raw === "nba") return raw;
  return "football";
}

/**
 * Stub de API: hoje devolve o mesmo payload que o cliente pode gerar offline.
 * Trocar implementação por fetch a serviço ML / odds sem alterar o contrato JSON.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = parseSport(searchParams.get("sport"));
  const snapshot = await getInteligenciaSnapshot(sport);

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
      "X-Barbosa-Intel-Source": snapshot.meta.source,
    },
  });
}
