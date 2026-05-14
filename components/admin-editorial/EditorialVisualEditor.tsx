"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { legadoTextoParaHtmlSeguro } from "@/lib/analises/sanitize-html";

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";

const textareaClass =
  "min-h-[280px] w-full resize-y rounded-b-xl border-0 bg-[#050608] px-4 py-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none focus:ring-2 focus:ring-inset focus:ring-[#C9A227]/35 sm:min-h-[320px]";

const toolbarBtn =
  "min-h-[40px] shrink-0 rounded-lg border border-[#3d3420]/90 bg-[#12100c] px-2.5 py-1.5 text-center text-[11px] font-semibold text-[#E8D48B] shadow-sm transition hover:border-[#C9A227]/45 hover:bg-[#1a1610] active:scale-[0.98] sm:px-3 sm:text-xs";

function applyWrap(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): { next: string; selStart: number; selEnd: number } {
  const sel = value.slice(start, end);
  const inner = sel || placeholder;
  const next = value.slice(0, start) + before + inner + after + value.slice(end);
  const i0 = start + before.length;
  const i1 = i0 + inner.length;
  const i2 = i1 + after.length;
  return {
    next,
    selStart: sel ? i2 : i0,
    selEnd: sel ? i2 : i1,
  };
}

function insertBlock(
  value: string,
  start: number,
  end: number,
  block: string,
): { next: string; selStart: number; selEnd: number } {
  const prefix = start > 0 && !/\n\n$/.test(value.slice(0, start)) ? "\n\n" : "";
  const suffix = "\n\n";
  const insertion = prefix + block + suffix;
  const next = value.slice(0, start) + insertion + value.slice(end);
  const pos = start + insertion.length;
  return { next, selStart: pos, selEnd: pos };
}

function safeHrefForAttr(href: string): string {
  const t = href.trim().replace(/\s+/g, "");
  let h = t;
  if (!/^https?:\/\//i.test(h)) {
    h = `https://${h.replace(/^\/+/, "")}`;
  }
  return h.replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E");
}

type Props = {
  /** Valor inicial (edição). */
  defaultValue?: string;
  /** id do textarea (label + acessibilidade). */
  textareaId?: string;
};

export function EditorialVisualEditor({
  defaultValue = "",
  textareaId = "conteudo",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const focusRange = useCallback((start: number, end: number) => {
    const ta = taRef.current;
    if (!ta) return;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, end);
    });
  }, []);

  const wrap = useCallback(
    (before: string, after: string, placeholder: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const { next, selStart, selEnd } = applyWrap(
        value,
        start,
        end,
        before,
        after,
        placeholder,
      );
      setValue(next);
      focusRange(selStart, selEnd);
    },
    [value, focusRange],
  );

  const block = useCallback(
    (html: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const { next, selStart, selEnd } = insertBlock(value, start, end, html);
      setValue(next);
      focusRange(selStart, selEnd);
    },
    [value, focusRange],
  );

  const onLink = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const label = value.slice(start, end) || "texto do link";
    const url = window.prompt("URL do link (https://…)", "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    const href = safeHrefForAttr(trimmed);
    const snippet = `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    const next = value.slice(0, start) + snippet + value.slice(end);
    setValue(next);
    focusRange(start + snippet.length, start + snippet.length);
  }, [value, focusRange]);

  const previewHtml = legadoTextoParaHtmlSeguro(value);
  const previewSafe =
    previewHtml ||
    '<p class="text-zinc-600 italic m-0">Sem conteúdo ainda. Use a barra de ferramentas ou escreva HTML permitido.</p>';

  return (
    <div className="sm:col-span-2">
      <label htmlFor={textareaId} className={label}>
        Conteúdo
      </label>
      <p className="mb-2 text-xs text-zinc-500">
        Editor simples: a barra insere HTML seguro (negrito, listas, citações, etc.).
        Parágrafos em texto simples continuam válidos (linha em branco separa blocos).
      </p>

      <div className="overflow-hidden rounded-xl border border-[#3d3420]/90 bg-[#0c0b09] shadow-inner">
        <div
          className="flex flex-wrap gap-1 border-b border-[#3d3420]/80 bg-[#080706] p-2"
          role="toolbar"
          aria-label="Formatação do conteúdo"
        >
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => wrap("<strong>", "</strong>", "negrito")}
          >
            Negrito
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => wrap("<em>", "</em>", "itálico")}
          >
            Itálico
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              block('<h2 class="text-xl font-bold text-white mt-6 mb-2">Título</h2>')
            }
          >
            Título
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              block(
                '<h3 class="text-lg font-semibold text-zinc-100 mt-4 mb-2">Subtítulo</h3>',
              )
            }
          >
            Subtítulo
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              block(
                "<ul>\n<li>Primeiro item</li>\n<li>Segundo item</li>\n</ul>",
              )
            }
          >
            Lista
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              block(
                '<blockquote class="border-l-4 border-[#C9A227]/60 pl-4 text-zinc-300 italic my-4"><p>Citação</p></blockquote>',
              )
            }
          >
            Citação
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onLink}
          >
            Link
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => block("<hr />")}
          >
            Separador
          </button>
        </div>

        <textarea
          ref={taRef}
          id={textareaId}
          name="conteudo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={textareaClass}
          spellCheck
          autoComplete="off"
          placeholder="Escreva o texto da análise ou use os botões acima para inserir formatação."
        />
      </div>

      <div className="mt-4">
        <p className={label}>Pré-visualização</p>
        <div className="max-h-[min(420px,55vh)] overflow-y-auto rounded-xl border border-[#3d3420]/80 bg-[#080706] p-4 sm:p-5">
          <div
            className="analise-editor-preview prose prose-invert prose-sm max-w-none prose-headings:font-display prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-a:text-[#C9A227] prose-blockquote:border-[#C9A227]/50 prose-blockquote:text-zinc-400 prose-hr:border-zinc-600 prose-li:marker:text-[#C9A227]/80"
            // eslint-disable-next-line react/no-danger -- mesmo pipeline que /analise/[slug] (DOMPurify)
            dangerouslySetInnerHTML={{ __html: previewSafe }}
          />
        </div>
      </div>
    </div>
  );
}
