import { sanitizeAnaliseHtml } from "@/lib/analises/sanitize-html";

function escapeHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, "&#39;");
}

/**
 * Markdown inline mínimo: links [t](https://…), **negrito**, *itálico*.
 * O texto é escapado antes; só marcas permitidas viram HTML.
 */
export function markdownAnaliseInlineParaHtml(raw: string): string {
  let t = escapeHtml(raw);
  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi,
    (_, lab: string, href: string) =>
      `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${lab}</a>`,
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  return t;
}

function processBlock(block: string): string {
  const b = block.trim();
  if (!b) return "";

  if (/^(-{3,}|\*{3,})$/.test(b)) {
    return "<hr />";
  }

  const lines = block.split("\n");
  const first = lines[0].trim();

  if (/^#\s+/.test(first) && !/^##\s/.test(first)) {
    const rest = lines.slice(1);
    const h = markdownAnaliseInlineParaHtml(first.replace(/^#\s+/, "").trim());
    const tail =
      rest.length && rest.some((l) => l.trim())
        ? rest
            .map((l) => `<p>${markdownAnaliseInlineParaHtml(l)}</p>`)
            .join("")
        : "";
    return `<h1>${h}</h1>${tail}`;
  }

  if (/^##\s+/.test(first) && !/^###\s/.test(first)) {
    const rest = lines.slice(1);
    const h = markdownAnaliseInlineParaHtml(first.replace(/^##\s+/, "").trim());
    const tail =
      rest.length && rest.some((l) => l.trim())
        ? rest
            .map((l) => `<p>${markdownAnaliseInlineParaHtml(l)}</p>`)
            .join("")
        : "";
    return `<h2>${h}</h2>${tail}`;
  }

  const nonEmpty = lines.filter((l) => l.trim());
  if (
    nonEmpty.length > 0 &&
    nonEmpty.every((l) => /^\s*-\s+.+/.test(l))
  ) {
    const items = nonEmpty.map((l) => {
      const inner = l.replace(/^\s*-\s+/, "");
      return `<li>${markdownAnaliseInlineParaHtml(inner)}</li>`;
    });
    return `<ul>${items.join("")}</ul>`;
  }

  if (
    nonEmpty.length > 0 &&
    nonEmpty.every((l) => /^\s*>/.test(l))
  ) {
    const parts = nonEmpty.map((l) =>
      markdownAnaliseInlineParaHtml(l.replace(/^\s*>\s?/, "").trim()),
    );
    return `<blockquote><p>${parts.join("<br />")}</p></blockquote>`;
  }

  const body = lines
    .map((l) => markdownAnaliseInlineParaHtml(l))
    .join("<br />");
  return `<p>${body}</p>`;
}

/**
 * Converte markdown editorial simples para HTML e aplica DOMPurify.
 */
export function markdownAnaliseSimplesParaHtmlSeguro(md: string): string {
  const s = String(md ?? "").trim();
  if (!s) return "";
  const blocks = s.split(/\n{2,}/);
  const html = blocks.map(processBlock).join("");
  return sanitizeAnaliseHtml(html);
}
