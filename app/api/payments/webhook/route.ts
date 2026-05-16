import { NextRequest, NextResponse } from "next/server";
import {
  fetchMercadoPagoPayment,
  processApprovedMercadoPagoPayment,
  verifyMercadoPagoWebhook,
} from "@/lib/payments/mercado-pago";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function paymentIdFromPayload(payload: unknown, request: NextRequest): string {
  const url = request.nextUrl;
  const queryId = url.searchParams.get("data.id") || url.searchParams.get("id");
  if (queryId) return queryId;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const data = record.data;
    if (data && typeof data === "object" && "id" in data) {
      return String((data as { id: unknown }).id);
    }
    if ("id" in record) return String(record.id);
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const paymentId = paymentIdFromPayload(payload, request);
    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: "missing_payment_id" });
    }

    if (!verifyMercadoPagoWebhook(request, paymentId)) {
      return NextResponse.json({ ok: false, error: "Webhook inválido." }, { status: 401 });
    }

    const payment = await fetchMercadoPagoPayment(paymentId);
    const result = await processApprovedMercadoPagoPayment(payment);

    return NextResponse.json(
      { ok: true, paymentId, result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("payments webhook", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro no webhook.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
