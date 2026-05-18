import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { findAuthUserByEmail, grantEntitlement } from "@/lib/access/entitlements";
import {
  getEntitlementExpiration,
  getPaymentProduct,
  type PaymentProductCode,
} from "@/lib/payments/products";

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id: number | string;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
  payer?: { email?: string };
  metadata?: {
    order_id?: string;
    product_code?: string;
    email?: string;
  };
};

type MercadoPagoTokenDiagnostics = {
  configured: boolean;
  tokenPrefix: string | null;
  tokenLength: number;
  usingSandbox: boolean;
  environment: string;
  expectedPrefix: "APP_USR-";
};

export type PaymentOrderRow = {
  id: string;
  user_id: string | null;
  email: string;
  product_code: PaymentProductCode;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

function tokenLooksSandbox(token: string | undefined): boolean {
  const normalized = token?.trim().toUpperCase() ?? "";
  return normalized.startsWith("TEST-") || normalized.startsWith("TEST_USR");
}

function safeUrlHost(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}

export function getMercadoPagoRuntimeDiagnostics(): MercadoPagoTokenDiagnostics {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  return {
    configured: Boolean(token),
    tokenPrefix: token ? token.slice(0, 12) : null,
    tokenLength: token?.length ?? 0,
    usingSandbox: tokenLooksSandbox(token),
    environment: process.env.NODE_ENV ?? "unknown",
    expectedPrefix: "APP_USR-",
  };
}

function mercadoPagoToken(): string {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  const diagnostics = getMercadoPagoRuntimeDiagnostics();
  console.log("[MP TOKEN PREFIX]", diagnostics.tokenPrefix);
  console.log("[MP ENVIRONMENT]", {
    nodeEnv: diagnostics.environment,
    usingSandbox: diagnostics.usingSandbox,
    tokenConfigured: diagnostics.configured,
    tokenLength: diagnostics.tokenLength,
  });
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
  if (tokenLooksSandbox(token)) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN está usando credencial de teste.");
  }
  if (!token.startsWith("APP_USR-")) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN deve ser uma credencial de produção APP_USR-.");
  }
  return token;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createPaymentOrder(params: {
  email: string;
  productCode: PaymentProductCode;
  amount: number;
}): Promise<PaymentOrderRow> {
  const admin = createAdminClient();
  const email = normalizeEmail(params.email);
  const authUser = await findAuthUserByEmail(email);
  const { data, error } = await admin
    .from("payment_orders")
    .insert({
      user_id: authUser?.id ?? null,
      email,
      product_code: params.productCode,
      status: "pending",
      amount: params.amount,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Não foi possível criar pedido de pagamento.");
  }
  return data as PaymentOrderRow;
}

export async function createMercadoPagoPreference(params: {
  origin: string;
  order: PaymentOrderRow;
}) {
  const product = getPaymentProduct(params.order.product_code);
  if (!product) throw new Error("Produto inválido.");

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mercadoPagoToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: product.code,
          title: product.title,
          description: product.description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: product.amount,
        },
      ],
      payer: { email: params.order.email },
      external_reference: params.order.id,
      notification_url: `${params.origin}/api/payments/webhook`,
      back_urls: {
        success: `${params.origin}/checkout/${product.code}?status=success`,
        pending: `${params.origin}/checkout/${product.code}?status=pending`,
        failure: `${params.origin}/checkout/${product.code}?status=failure`,
      },
      auto_return: "approved",
      metadata: {
        order_id: params.order.id,
        product_code: product.code,
        email: params.order.email,
      },
    }),
  });

  const body = (await response.json()) as MercadoPagoPreferenceResponse & { message?: string };
  console.log("[MP CREATE PREFERENCE RESPONSE]", {
    ok: response.ok,
    status: response.status,
    preferenceId: body.id ?? null,
    hasInitPoint: Boolean(body.init_point),
    hasSandboxInitPoint: Boolean(body.sandbox_init_point),
    initPointType: body.init_point ? "init_point" : body.sandbox_init_point ? "sandbox_init_point" : "none",
    initPointHost: safeUrlHost(body.init_point),
    sandboxInitPointHost: safeUrlHost(body.sandbox_init_point),
    message: body.message ?? null,
  });
  if (!response.ok) {
    throw new Error(body.message || "Mercado Pago recusou a criação da preferência.");
  }

  const admin = createAdminClient();
  await admin
    .from("payment_orders")
    .update({ mp_preference_id: body.id, status: "preference_created" })
    .eq("id", params.order.id);

  return {
    preferenceId: body.id,
    initPoint: body.init_point ?? "",
    initPointType: body.init_point ? "init_point" : body.sandbox_init_point ? "sandbox_init_point" : "none",
  };
}

function parseMercadoPagoSignature(signature: string | null): Record<string, string> {
  if (!signature) return {};
  return Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim() ?? "", value?.trim() ?? ""];
    }),
  );
}

export function verifyMercadoPagoWebhook(request: NextRequest, paymentId: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return true;

  const directSecret = request.headers.get("x-webhook-secret");
  if (directSecret && directSecret === secret) return true;

  const signature = parseMercadoPagoSignature(request.headers.get("x-signature"));
  const requestId = request.headers.get("x-request-id");
  if (!signature.ts || !signature.v1 || !requestId || !paymentId) return false;

  const manifest = `id:${paymentId};request-id:${requestId};ts:${signature.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  if (expected.length !== signature.v1.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature.v1));
}

export async function fetchMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPaymentResponse> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${mercadoPagoToken()}` },
  });
  const body = (await response.json()) as MercadoPagoPaymentResponse & { message?: string };
  if (!response.ok) {
    throw new Error(body.message || "Não foi possível consultar pagamento Mercado Pago.");
  }
  return body;
}

export async function processApprovedMercadoPagoPayment(payment: MercadoPagoPaymentResponse) {
  const paymentId = String(payment.id);
  const orderId = payment.external_reference || payment.metadata?.order_id;
  if (!orderId) throw new Error("Pagamento sem external_reference/order_id.");

  const admin = createAdminClient();
  const { data: orderData, error: orderError } = await admin
    .from("payment_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !orderData) {
    throw new Error(orderError?.message || "Pedido de pagamento não encontrado.");
  }

  const order = orderData as PaymentOrderRow;
  const product = getPaymentProduct(order.product_code);
  if (!product) throw new Error("Produto do pedido inválido.");

  const authUser = await findAuthUserByEmail(order.email);
  const status = payment.status === "approved" && authUser?.id ? "approved" : payment.status || "unknown";

  await admin
    .from("payment_orders")
    .update({
      user_id: authUser?.id ?? order.user_id,
      mp_payment_id: paymentId,
      status: payment.status === "approved" && !authUser?.id ? "approved_no_user" : status,
      amount: payment.transaction_amount ?? order.amount,
    })
    .eq("id", order.id);

  if (payment.status !== "approved") {
    return { ok: true as const, granted: false, status: payment.status ?? "unknown" };
  }

  if (!authUser?.id) {
    return { ok: true as const, granted: false, status: "approved_no_user" };
  }

  const grant = await grantEntitlement({
    userId: authUser.id,
    entitlement: product.entitlement,
    expiresAt: getEntitlementExpiration(product),
    source: "mercado_pago",
    externalPaymentId: paymentId,
  });

  if (!grant.ok) throw new Error(grant.error);

  return { ok: true as const, granted: true, status: "approved" };
}
