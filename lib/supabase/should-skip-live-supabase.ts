/**
 * Quando `NEXT_PUBLIC_SUPABASE_MOCK=true`, o backend Supabase ao vivo é ignorado
 * (útil para desenvolvimento com dados estáticos).
 *
 * No **navegador**, não inferimos “sem URL” só por falta de `NEXT_PUBLIC_SUPABASE_URL`
 * no bundle (build sem a variável não deve desativar o cliente em produção).
 * Fluxos sensíveis (ex.: bolão) validam credenciais na API ou em server actions.
 *
 * No **servidor** (SSR, Server Actions, Route Handlers), sem URL configurável
 * ou sem chave utilizável (anon ou service role) → considera-se backend ao vivo
 * indisponível para evitar chamadas reais acidentais.
 */
function env(name: "MOCK" | "URL" | "ANON"): string | undefined {
  const prefix = "NEXT_PUBLIC_SUPABASE_";
  const suffix =
    name === "MOCK" ? "MOCK" : name === "URL" ? "URL" : "ANON_KEY";
  const key = `${prefix}${suffix}`;
  return typeof process !== "undefined" ? process.env[key] : undefined;
}

function serviceRoleKey(): string | undefined {
  return typeof process !== "undefined"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    : undefined;
}

function supabaseUrl(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    undefined
  );
}

export function shouldSkipLiveSupabase(): boolean {
  if (env("MOCK") === "true") return true;
  if (env("MOCK") === "false") return false;

  if (typeof window !== "undefined") {
    return false;
  }

  const url = supabaseUrl();
  const anon = env("ANON")?.trim();
  const service = serviceRoleKey();

  if (!url) return true;
  if (anon || service) return false;
  return true;
}
