import { siteConfig } from "@/config/site";
import { getSiteBaseUrl } from "@/lib/seo/base-url";
import { buildKeywordsFromParts, buildShortDescription } from "@/lib/seo/auto-seo";
import type { QuickPickRow } from "@/lib/picks/types";
import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";

export function canonicalUrlPick(id: string): string {
  return `${getSiteBaseUrl()}/pick/${encodeURIComponent(id)}`;
}

export function tituloSeoPick(pick: QuickPickRow): string {
  const j = pick.jogo?.trim() || "Pick rápida";
  return `${j} — ${pick.mercado} @${pick.odd} | ${siteConfig.shortTitle}`;
}

export function descricaoSeoPick(pick: QuickPickRow): string {
  return buildShortDescription(
    [
      `${rotuloEsporte(pick.esporte)}. ${pick.mercado} @${pick.odd}. Confiança ${pick.confianca}%.`,
      pick.justificativa,
      pick.campeonato,
    ],
    160,
  );
}

export function keywordsSeoPick(pick: QuickPickRow): string[] {
  return buildKeywordsFromParts([
    rotuloEsporte(pick.esporte),
    pick.campeonato,
    pick.mercado,
    pick.jogo,
    pick.status,
    pick.resultado,
  ]);
}
