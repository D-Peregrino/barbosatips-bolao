import { markdownAnaliseSimplesParaHtmlSeguro } from "@/lib/analises/markdown-analise-simples";
import { sanitizeAnaliseHtml } from "@/lib/analises/sanitize-html";

/**
 * HTML seguro para exibir o corpo da análise na página pública ou pré-visualização.
 * HTML legado passa por DOMPurify; caso contrário interpreta-se markdown simples.
 */
export function conteudoAnaliseParaHtmlPublico(conteudo: string): string {
  const s = String(conteudo ?? "").trim();
  if (!s) return "";
  if (/<[a-z][\s\S]*>/i.test(s)) {
    return sanitizeAnaliseHtml(s);
  }
  return markdownAnaliseSimplesParaHtmlSeguro(s);
}
