import { NextResponse } from "next/server";
import { getMercadoPagoRuntimeDiagnostics } from "@/lib/payments/mercado-pago";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const diagnostics = getMercadoPagoRuntimeDiagnostics();

  return NextResponse.json(
    {
      usandoSandbox: diagnostics.usingSandbox,
      tokenPrefix: diagnostics.tokenPrefix,
      initPointType: "init_point",
      envDetectado: diagnostics.environment,
      tokenConfigurado: diagnostics.configured,
      tokenLength: diagnostics.tokenLength,
      expectedPrefix: diagnostics.expectedPrefix,
      sdkMode: "rest_api",
      apiBaseUrl: "https://api.mercadopago.com",
      usesSandboxInitPoint: false,
      productionReady:
        diagnostics.configured &&
        !diagnostics.usingSandbox &&
        diagnostics.tokenPrefix?.startsWith(diagnostics.expectedPrefix) === true,
      observacao:
        "O checkout deve usar init_point. Se Mercado Pago acusar teste com APP_USR-, confira se a conta compradora nao e a mesma conta vendedora.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
