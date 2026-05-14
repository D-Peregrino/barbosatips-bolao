/**
 * Logger operacional centralizado (browser + Node).
 * Sem PII: não passar emails, tokens ou corpos de pedido completos em `meta`.
 */

export type OpsLogLevel = "info" | "warn" | "error";

export type OpsLogPayload = {
  ts: string;
  level: OpsLogLevel;
  scope: string;
  message: string;
  digest?: string;
  [key: string]: unknown;
};

function sink(payload: OpsLogPayload): void {
  const line = `[BarbosaTips:${payload.scope}] ${payload.message}`;
  if (payload.level === "error") {
    console.error(line, payload);
    return;
  }
  if (payload.level === "warn") {
    console.warn(line, payload);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(line, payload);
  }
}

export function opsLog(
  level: OpsLogLevel,
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
): void {
  const payload: OpsLogPayload = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...meta,
  };
  sink(payload);
}

export function opsLogError(
  scope: string,
  err: unknown,
  meta?: Record<string, unknown>,
): void {
  const e = err instanceof Error ? err : new Error(String(err));
  opsLog("error", scope, e.message, {
    name: e.name,
    digest: (e as Error & { digest?: string }).digest,
    ...meta,
  });
}
