/**
 * Modo local sem Supabase:
 * - NEXT_PUBLIC_SUPABASE_MOCK=true, ou
 * - sem NEXT_PUBLIC_SUPABASE_URL, ou
 * - sem nenhuma chave utilizável (anon pública OU service role no servidor).
 *
 * Com URL + (ANON_KEY ou SERVICE_ROLE_KEY), o projeto trata como backend configurado.
 * `NEXT_PUBLIC_SUPABASE_MOCK=false` força modo real (desde que URL exista).
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

export function isSupabaseMock(): boolean {
  if (env("MOCK") === "true") return true;
  if (env("MOCK") === "false") return false;

  const url = env("URL")?.trim();
  const anon = env("ANON")?.trim();
  const service = serviceRoleKey();

  if (!url) return true;
  if (anon || service) return false;
  return true;
}
