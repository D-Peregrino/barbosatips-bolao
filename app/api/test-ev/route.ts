import { NextResponse } from "next/server";
import {
  calculateEV,
  classifyEV,
  fairOdd,
  formatInsightForApi,
  generateMarketInsight,
  impliedProbability,
} from "@/lib/betting/ev-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const EXAMPLE = {
  market: "Over 2.5",
  realProbability: 67,
  marketOdd: 1.9,
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const marketLabel =
    searchParams.get("market")?.trim() || EXAMPLE.market;
  const realProbabilityRaw =
    searchParams.get("realProbability") ?? String(EXAMPLE.realProbability);
  const marketOddRaw =
    searchParams.get("marketOdd") ?? String(EXAMPLE.marketOdd);

  const realProbability = Number(realProbabilityRaw);
  const marketOdd = Number(marketOddRaw);

  if (!Number.isFinite(realProbability) || !Number.isFinite(marketOdd)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Parâmetros inválidos. Use realProbability e marketOdd numéricos.",
        example: EXAMPLE,
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const insight = generateMarketInsight({
      marketLabel,
      realProbability,
      marketOdd,
    });

    const implied = impliedProbability(marketOdd);
    const fair = fairOdd(realProbability);
    const ev = calculateEV(realProbability, marketOdd);
    const tier = classifyEV(ev);

    return NextResponse.json(
      {
        ok: true,
        ...formatInsightForApi(insight),
        fairOdd: fair,
        impliedProbability: implied,
        edge: insight.edge,
        ev,
        tier,
        example: EXAMPLE,
        formula: {
          impliedProbability: "100 / marketOdd",
          fairOdd: "100 / realProbability",
          ev: "(realProbability/100 * marketOdd) - 1",
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao calcular EV";
    return NextResponse.json(
      { ok: false, error: message, example: EXAMPLE },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
