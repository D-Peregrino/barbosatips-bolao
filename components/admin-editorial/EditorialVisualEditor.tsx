"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { conteudoAnaliseParaHtmlPublico } from "@/lib/analises/render-conteudo-analise";

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C9A227]";

const textareaClass =
  "min-h-[280px] w-full resize-y rounded-b-xl border-0 bg-[#050608] px-4 py-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none focus:ring-2 focus:ring-inset focus:ring-[#C9A227]/40 sm:min-h-[320px]";

/** Barra visível: contraste alto (preto + dourado). */
const toolbarWrap =
  "rounded-t-xl border-2 border-b-0 border-[#d4af37]/70 bg-gradient-to-b from-[#2a2318] to-[#1a1510] px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,215,128,.12)] sm:px-3";

const toolbarBtn =
  "min-h-[44px] min-w-[2.75rem] shrink-0 rounded-lg border-2 border-[#C9A227]/50 bg-[#0f0d0a] px-2.5 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#ffd966] shadow-[0_2px_8px_rgba(0,0,0,.45)] transition hover:border-[#E8D48B] hover:bg-[#1f1a12] hover:text-white active:scale-[0.97] sm:min-w-0 sm:px-3 sm:text-xs";

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
  const prefix =
    start > 0 && !/\n\n$/.test(value.slice(0, start)) ? "\n\n" : "";
  const suffix = "\n\n";
  const insertion = prefix + block + suffix;
  const next = value.slice(0, start) + insertion + value.slice(end);
  const pos = start + insertion.length;
  return { next, selStart: pos, selEnd: pos };
}

type Props = {
  defaultValue?: string;
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
    (md: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const { next, selStart, selEnd } = insertBlock(value, start, end, md);
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
    const label = value.slice(start, end).trim() || "texto";
    const url = window.prompt("URL do link", "https://");
    if (url === null) return;
    const href = url.trim() || "https://";
    const snippet = `[${label}](${href})`;
    const next = value.slice(0, start) + snippet + value.slice(end);
    setValue(next);
    focusRange(start + snippet.length, start + snippet.length);
  }, [value, focusRange]);

  const previewHtml = conteudoAnaliseParaHtmlPublico(value);
  const previewSafe =
    previewHtml ||
    '<p class="text-zinc-500 italic m-0">Pré-visualização vazia. Escreva markdown ou use os botões acima.</p>';

  return (
    <div className="w-full min-w-0 space-y-2">
      <label htmlFor={textareaId} className={label}>
        Conteúdo (markdown)
      </label>
      <p className="text-xs text-zinc-400">
        Barra dourada: insere markdown no cursor. Parágrafos: linha em branco entre
        blocos. Conteúdo antigo em HTML continua a ser aceite.
      </p>

      <div className="overflow-hidden rounded-xl border-2 border-[#C9A227]/45 bg-[#0a0908] shadow-[0_12px_40px_-8px_rgba(0,0,0,.6)]">
        <div
          className={toolbarWrap}
          role="toolbar"
          aria-label="Inserir markdown"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden w-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a773f] sm:mb-0 sm:inline sm:w-auto sm:pr-2">
              Formatar
            </span>
            <button
              type="button"
              className={toolbarBtn}
              title="Negrito **texto**"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrap("**", "**", "texto")}
            >
              Negrito
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Itálico *texto*"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrap("*", "*", "texto")}
            >
              Itálico
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Título # …"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => block("# Titulo")}
            >
              H1
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Subtítulo ## …"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => block("## Subtitulo")}
            >
              H2
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Lista com traço"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => block("- item\n- item")}
            >
              Lista
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Citação > …"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => block("> texto")}
            >
              Citação
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Link [texto](url)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onLink}
            >
              Link
            </button>
            <button
              type="button"
              className={toolbarBtn}
            title="Linha separadora ---"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => block("---")}
          >
            Separador
          </button>
          </div>
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
          placeholder="Escreva em markdown (negrito, listas, # títulos…) ou cole HTML legado."
        />
      </div>

      <div className="pt-2">
        <p className={label}>Pré-visualização</p>
        <div className="max-h-[min(420px,55vh)] overflow-y-auto rounded-xl border border-[#3d3420]/90 bg-[#080706] p-4 sm:p-5">
          <div
            className="analise-editor-preview prose prose-invert prose-sm max-w-none prose-headings:font-display prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-a:text-[#C9A227] prose-blockquote:border-[#C9A227]/50 prose-blockquote:text-zinc-400 prose-hr:border-zinc-600 prose-li:marker:text-[#C9A227]/80"
            // eslint-disable-next-line react/no-danger -- pipeline com DOMPurify (render-conteudo-analise)
            dangerouslySetInnerHTML={{ __html: previewSafe }}
          />
        </div>
      </div>
    </div>
  );
}
