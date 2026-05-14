/**
 * Canal de deployment — usar para staging, banners e políticas operacionais.
 * Não altera SEO; consumo interno (status, logs, flags).
 *
 * Staging: definir `BARBOSA_ENV=staging` ou `VERCEL_ENV=preview` com branch dedicada.
 */
export type DeploymentChannel = "local" | "preview" | "production" | "staging";

export function getDeploymentChannel(): DeploymentChannel {
  const explicit = process.env.BARBOSA_ENV?.trim().toLowerCase();
  if (explicit === "staging") return "staging";

  const vercel = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercel === "production") return "production";
  if (vercel === "preview") return "preview";

  if (process.env.NODE_ENV === "development") return "local";
  return "production";
}

export function isStagingChannel(): boolean {
  return getDeploymentChannel() === "staging";
}

export function isProductionChannel(): boolean {
  return getDeploymentChannel() === "production";
}
