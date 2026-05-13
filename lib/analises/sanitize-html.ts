import DOMPurify from "isomorphic-dompurify";

/** Tags permitidas no corpo editorial (Tiptap + HTML seguro). */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "hr",
  "div",
  "span",
];

/**
 * Remove scripts/atributos perigosos antes de gravar no Supabase ou renderizar.
 */
export function sanitizeAnaliseHtml(html: string): string {
  const dirty = String(html ?? "");
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Conteúdo antigo em texto puro vira parágrafos simples para exibição segura.
 */
export function legadoTextoParaHtmlSeguro(texto: string): string {
  const s = String(texto ?? "").trim();
  if (!s) return "";
  if (/<[a-z][\s\S]*>/i.test(s)) return sanitizeAnaliseHtml(s);
  const paragrafos = s
    .split(/\n{2,}/)
    .map((bloco) => `<p>${escapeHtml(bloco).replace(/\n/g, "<br />")}</p>`)
    .join("");
  return sanitizeAnaliseHtml(paragrafos);
}
