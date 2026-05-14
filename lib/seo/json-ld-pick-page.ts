import type { QuickPickRow } from "@/lib/picks/types";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs-model";
import { jsonLdBreadcrumbList, jsonLdGraphDocument, jsonLdSportsEventFromPick } from "@/lib/seo/json-ld";

/** Breadcrumb + SportsEvent para página pública da pick (sem Article — conteúdo curto). */
export function jsonLdPickDetailGraph(pick: QuickPickRow, crumbs: BreadcrumbItem[]) {
  return jsonLdGraphDocument([jsonLdBreadcrumbList(crumbs), jsonLdSportsEventFromPick(pick)]);
}
