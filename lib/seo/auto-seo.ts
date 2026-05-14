import { siteConfig } from "@/config/site";

const STRIP_HTML = /<[^>]+>/g;

/** Texto plano a partir de HTML ou texto bruto. */
export function stripHtmlToText(input: string): string {
  return String(input ?? "")
    .replace(STRIP_HTML, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Excerpt / resumo curto para cards, meta secundária e Discover. */
export function buildExcerpt(text: string, max = 200): string {
  const t = stripHtmlToText(text);
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/** Description SERP (~155–165). */
export function buildShortDescription(parts: string[], max = 160): string {
  const merged = parts.map((p) => stripHtmlToText(p)).filter(Boolean).join(" — ");
  const base = merged.replace(/\s+/g, " ").trim();
  if (base.length <= max) return base || siteConfig.description.slice(0, max);
  return `${base.slice(0, max - 1).trimEnd()}…`;
}

/** Keywords únicas, minúsculas onde fizer sentido, sem duplicar marca. */
export function buildKeywordsFromParts(parts: (string | undefined | null)[]): string[] {
  const set = new Set<string>([
    "BarbosaTips",
    "apostas esportivas",
    "prognóstico",
    "prognostico",
    "odds",
    "tips",
  ]);
  for (const p of parts) {
    const t = String(p ?? "").trim();
    if (t.length < 2) continue;
    set.add(t);
    for (const w of t.split(/[,;/|]+/).map((x) => x.trim())) {
      if (w.length >= 2) set.add(w);
    }
  }
  return Array.from(set);
}
