import type { AnaliseRow } from "@/lib/analises/types";
import {
  jsonLdArticleAnaliseGraphNode,
  jsonLdSportsEventFromAnalise,
} from "@/lib/analises/seo-analise";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs-model";
import { jsonLdBreadcrumbList, jsonLdGraphDocument } from "@/lib/seo/json-ld";

export function jsonLdAnaliseDetailGraph(a: AnaliseRow, crumbs: BreadcrumbItem[]) {
  return jsonLdGraphDocument([
    jsonLdArticleAnaliseGraphNode(a),
    jsonLdBreadcrumbList(crumbs),
    jsonLdSportsEventFromAnalise(a),
  ]);
}
