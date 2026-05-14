import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  jsonLdGraphDocument,
  jsonLdOrganization,
  jsonLdWebSiteWithPublisher,
} from "@/lib/seo/json-ld";

/** Organization + WebSite em @graph (uma vez no layout raiz). */
export function SiteWideJsonLd() {
  const data = jsonLdGraphDocument([jsonLdOrganization(), jsonLdWebSiteWithPublisher()]);
  return <JsonLdScript id="site-wide-jsonld" data={data} />;
}
