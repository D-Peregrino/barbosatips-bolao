import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";

const BASE = ["BarbosaTips", "Tips", "ApostasEsportivas"];

export function buildHashtags(extra: string[] = [], max = 12): string {
  const tags = new Set<string>();
  for (const t of BASE) tags.add(t);
  for (const e of extra) {
    const clean = e
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");
    if (clean.length >= 3) tags.add(clean);
  }
  return Array.from(tags)
    .slice(0, max)
    .map((t) => `#${t}`)
    .join(" ");
}

export function hashtagsEsporte(esporte: string): string {
  const label = rotuloEsporte(esporte);
  return buildHashtags([label, esporte, "Green", "ROI"]);
}

export function hashtagsAnalise(esporte: string, campeonato?: string): string {
  const extra = [esporte, campeonato ?? "", "Analise", "Odds"].filter(Boolean);
  return buildHashtags(extra);
}
