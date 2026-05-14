/**
 * Feature flags futuras — só leitura de env, defaults conservadores (off).
 * Prefixo `BARBOSA_FLAG_` no servidor; `NEXT_PUBLIC_BARBOSA_FLAG_` só quando
 * precisares expor ao cliente (evitar por defeito).
 */
function readBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") return defaultValue;
  const v = value.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes" || v === "on") return true;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  return defaultValue;
}

export type FeatureFlagKey = keyof typeof FEATURE_FLAG_ENV;

/** Mapeamento nome → variável de ambiente (sem valor em runtime aqui). */
export const FEATURE_FLAG_ENV = {
  /** Banner discreto em staging / preview. */
  stagingRibbon: "BARBOSA_FLAG_STAGING_RIBBON",
  /** Ilhas UI experimentais (activar só com critério). */
  experimentalUi: "BARBOSA_FLAG_EXPERIMENTAL_UI",
} as const;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  const name = FEATURE_FLAG_ENV[flag];
  return readBoolEnv(process.env[name], false);
}
