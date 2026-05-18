import { NextResponse } from "next/server";
import { getPaymentProduct, getPaymentProductCheckoutError } from "@/lib/payments/products";
import {
  createMercadoPagoPreference,
  createPaymentOrder,
} from "@/lib/payments/mercado-pago";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      product_code?: string;
      email?: string;
    };
    const product = getPaymentProduct(String(body.product_code ?? ""));
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!product) {
      return NextResponse.json({ ok: false, error: "Produto inválido." }, { status: 400 });
    }
    const checkoutError = getPaymentProductCheckoutError(product);
    if (checkoutError) {
      return NextResponse.json({ ok: false, error: checkoutError }, { status: 503 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Informe um email válido." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const order = await createPaymentOrder({
      email,
      productCode: product.code,
      amount: product.amount,
    });
    const preference = await createMercadoPagoPreference({ origin, order });
    console.log("[MP CHECKOUT PREFERENCE]", {
      productCode: product.code,
      orderId: order.id,
      preferenceId: preference.preferenceId,
      initPointType: preference.initPointType,
      hasInitPoint: Boolean(preference.initPoint),
      initPointHost: preference.initPoint ? new URL(preference.initPoint).host : null,
      nodeEnv: process.env.NODE_ENV ?? "unknown",
    });

    if (!preference.initPoint) {
      return NextResponse.json(
        { ok: false, error: "Mercado Pago não retornou init_point." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        init_point: preference.initPoint,
        preference_id: preference.preferenceId,
        order_id: order.id,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("create-preference", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro ao criar checkout.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
