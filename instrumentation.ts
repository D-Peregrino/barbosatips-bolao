export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { opsLog } = await import("@/lib/ops/logger");
    opsLog("info", "instrumentation", "bootstrap servidor", {
      node: process.version,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    });
  }
}
