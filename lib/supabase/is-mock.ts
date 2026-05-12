/**
 * Modo local sem Supabase: sem URL/chave públicas, ou com NEXT_PUBLIC_SUPABASE_MOCK=true.
 * Com credenciais válidas no .env, defina NEXT_PUBLIC_SUPABASE_MOCK=false para usar o backend real.
 *
 * Usa chaves montadas em runtime para evitar que o bundler do Next infira valores fixos de
 * `process.env.NEXT_PUBLIC_*` em um módulo e não em outro (o que quebrava o early-return nos services).
 */
function env(name: "MOCK" | "URL" | "ANON"): string | undefined {
  const prefix = "NEXT_PUBLIC_SUPABASE_";
  const suffix =
    name === "MOCK" ? "MOCK" : name === "URL" ? "URL" : "ANON_KEY";
  const key = `${prefix}${suffix}`;
  return typeof process !== "undefined" ? process.env[key] : undefined;
}

export function isSupabaseMock(): boolean {
  if (env("MOCK") === "true") return true;
  if (env("MOCK") === "false") return false;

  const url = env("URL")?.trim();
  const key = env("ANON")?.trim();
  return !url || !key;
}