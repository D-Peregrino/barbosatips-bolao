/**
 * Inventário operacional: módulos críticos vs experimentais.
 * Convenção: envolver rotas ou ilhas experimentais com `SafeExperimentalBoundary`
 * ou `IsolatedClientMount` no layout/páginas.
 */

/** Fluxo core, pagamentos, auth, picks públicas, SEO shell. */
export const OPS_CRITICAL_MODULE_PATHS: readonly string[] = [
  "app/layout.tsx",
  "app/page.tsx",
  "middleware.ts",
  "lib/seo/**",
  "components/layout/**",
  "components/seo/**",
] as const;

/** Analytics, leads, PWA, laboratórios — falha não deve derrubar a shell. */
export const OPS_EXPERIMENTAL_MODULE_PATHS: readonly string[] = [
  "components/leads/**",
  "components/pwa/**",
  "components/live/**",
  "app/inteligencia/**",
  "components/inteligencia/**",
  "app/analytics/**",
  "app/operacional/**",
] as const;
