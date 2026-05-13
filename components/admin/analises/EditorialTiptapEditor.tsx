"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { sanitizeAnaliseHtml } from "@/lib/analises/sanitize-html";
import { cn } from "@/lib/utils";

const toolbarBtn =
  "rounded-lg border border-transparent px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition disabled:opacity-40";

const toolbarBtnActive =
  "border-[#C9A227]/60 bg-[#C9A227]/20 text-[#F0D78C] shadow-[0_0_12px_rgba(201,162,39,0.15)]";

const toolbarBtnIdle =
  "text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-zinc-200";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function EditorialTiptapEditor({ value, onChange, disabled }: Props) {
  const [previewHtml, setPreviewHtml] = useState(() =>
    sanitizeAnaliseHtml(value || "<p></p>"),
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        horizontalRule: { HTMLAttributes: { class: "editorial-hr" } },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-[#C9A227] underline underline-offset-2",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder:
          "Escreva a análise… Use a barra de ferramentas para negrito, títulos, listas e links.",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: value?.trim() ? value : "<p></p>",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "editorial-prosemirror min-h-[280px] px-4 py-3 text-sm leading-relaxed text-zinc-200 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const raw = ed.getHTML();
      const safe = sanitizeAnaliseHtml(raw);
      setPreviewHtml(safe);
      onChange(safe);
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const runLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link (https://…)", prev || "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    let finalUrl = trimmed;
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: finalUrl })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-8 text-center text-sm text-zinc-500">
        Carregando editor…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Conteúdo completo
      </p>

      <div
        className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-[#3d3420]/90 bg-[#14120e] px-2 py-2 sm:gap-1.5 sm:px-3"
        role="toolbar"
        aria-label="Formatação do texto"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            toolbarBtn,
            editor.isActive("bold") ? toolbarBtnActive : toolbarBtnIdle,
          )}
          title="Negrito"
        >
          B
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            toolbarBtn,
            editor.isActive("italic") ? toolbarBtnActive : toolbarBtnIdle,
          )}
          title="Itálico"
        >
          I
        </button>
        <span className="mx-1 hidden h-5 w-px bg-zinc-700 sm:inline" aria-hidden />
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={cn(
            toolbarBtn,
            editor.isActive("heading", { level: 1 })
              ? toolbarBtnActive
              : toolbarBtnIdle,
          )}
          title="Título 1"
        >
          H1
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            toolbarBtn,
            editor.isActive("heading", { level: 2 })
              ? toolbarBtnActive
              : toolbarBtnIdle,
          )}
          title="Título 2"
        >
          H2
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            toolbarBtn,
            editor.isActive("heading", { level: 3 })
              ? toolbarBtnActive
              : toolbarBtnIdle,
          )}
          title="Título 3"
        >
          H3
        </button>
        <span className="mx-1 hidden h-5 w-px bg-zinc-700 sm:inline" aria-hidden />
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            toolbarBtn,
            editor.isActive("bulletList") ? toolbarBtnActive : toolbarBtnIdle,
          )}
          title="Lista com marcadores"
        >
          • Lista
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            toolbarBtn,
            editor.isActive("orderedList") ? toolbarBtnActive : toolbarBtnIdle,
          )}
          title="Lista numerada"
        >
          1. Lista
        </button>
        <span className="mx-1 hidden h-5 w-px bg-zinc-700 sm:inline" aria-hidden />
        <button
          type="button"
          disabled={disabled}
          onClick={runLink}
          className={cn(
            toolbarBtn,
            editor.isActive("link") ? toolbarBtnActive : toolbarBtnIdle,
          )}
          title="Inserir ou editar link"
        >
          Link
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={cn(toolbarBtn, toolbarBtnIdle)}
          title="Linha horizontal"
        >
          ─
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            toolbarBtn,
            editor.isActive("blockquote") ? toolbarBtnActive : toolbarBtnIdle,
          )}
          title="Citação"
        >
          “ ”
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-b-xl border border-[#3d3420]/90 bg-[#050608] lg:rounded-br-none lg:border-r-0">
          <EditorContent editor={editor} />
        </div>
        <div className="flex min-h-[280px] flex-col rounded-xl border border-[#3d3420]/90 bg-[#0a0908] lg:rounded-bl-none lg:border-t lg:border-[#3d3420]/90">
          <div className="border-b border-[#3d3420]/80 px-3 py-2">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C9A227]">
              Preview em tempo real
            </span>
          </div>
          <div
            className="editorial-preview prose prose-invert prose-headings:font-display max-h-[min(480px,55vh)] flex-1 overflow-y-auto px-4 py-3 prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-a:text-[#C9A227] prose-blockquote:border-[#C9A227]/50 prose-blockquote:text-zinc-400 prose-hr:border-zinc-600"
            // eslint-disable-next-line react/no-danger -- HTML já sanitizado no estado
            dangerouslySetInnerHTML={{ __html: previewHtml || "<p></p>" }}
          />
        </div>
      </div>
    </div>
  );
}
