import { normalizarSlugEditorial } from "@/lib/admin-editorial/normalizar-slug";

/** Slug normalizado para consultas Supabase (alinhado ao CMS). */
export function slugParaConsulta(raw: string): string {
  const decoded = decodeURIComponent(String(raw ?? "")).trim();
  if (!decoded) return "";
  return normalizarSlugEditorial(decoded) || decoded.trim().toLowerCase();
}
