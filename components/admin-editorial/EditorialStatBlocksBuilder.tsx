"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { StatBlock, StatBlocksPayload } from "@/lib/analises/stat-blocks/types";
import {
  STAT_BLOCK_KIND_OPTIONS,
  emptyBlockForKind,
  parseStatBlocksPayload,
  serializeStatBlocksPayload,
} from "@/lib/analises/stat-blocks/parse";
import { EditorialStatBlockInlineEditor } from "@/components/admin-editorial/EditorialStatBlockInlineEditor";
import { cn } from "@/lib/utils";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `sb_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

const shell = "rounded-xl border border-[#3d3420]/80 bg-[#080706]/90";

type Props = {
  initialJson?: unknown;
};

export function EditorialStatBlocksBuilder({ initialJson }: Props) {
  const initialBlocks = useMemo(() => parseStatBlocksPayload(initialJson), [initialJson]);
  const [blocks, setBlocks] = useState<StatBlocksPayload>(initialBlocks);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(blocks[0]?.id ?? null);

  const replaceAt = (id: string, next: StatBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? next : b)));
  };

  const remove = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setOpenId((cur) => (cur === id ? null : cur));
  };

  const move = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      const t = copy[i];
      copy[i] = copy[j]!;
      copy[j] = t!;
      return copy;
    });
  };

  const addKind = (kind: StatBlock["kind"]) => {
    const id = newId();
    setBlocks((prev) => [...prev, emptyBlockForKind(kind, id)]);
    setOpenId(id);
    setPickerOpen(false);
  };

  const labelFor = (b: StatBlock) => STAT_BLOCK_KIND_OPTIONS.find((o) => o.kind === b.kind)?.label ?? b.kind;

  return (
    <div className={cn(shell, "p-4 sm:p-5")}>
      <input type="hidden" name="stat_blocks" value={serializeStatBlocksPayload(blocks)} readOnly aria-hidden />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-[#C9A227]/35 bg-[#C9A227]/10 text-[#E8D48B]">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9A227]">Estatísticas premium</p>
            <p className="text-xs text-zinc-500">
              Blocos opcionais — aparecem no topo da análise pública. Futuro: preencher via API desportiva.
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9A227]/45 bg-[#C9A227]/10 px-4 py-2.5 text-sm font-bold text-[#F5E6A8] transition hover:bg-[#C9A227]/16 sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar bloco estatístico
            <ChevronDown className={cn("h-4 w-4 transition", pickerOpen && "rotate-180")} aria-hidden />
          </button>
          {pickerOpen ? (
            <div className="absolute right-0 z-30 mt-2 max-h-[min(70vh,420px)] w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-xl border border-[#3d3420]/90 bg-[#0a0908] py-1 shadow-2xl">
              {STAT_BLOCK_KIND_OPTIONS.map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => addKind(opt.kind)}
                  className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-white/[0.05]"
                >
                  <span className="font-semibold text-white">{opt.label}</span>
                  <span className="text-[11px] text-zinc-500">{opt.hint}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-zinc-700/80 bg-black/30 px-3 py-4 text-center text-sm text-zinc-500">
          Sem blocos — adiciona métricas 1x2, xG, EV+, etc.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {blocks.map((b) => {
            const expanded = openId === b.id;
            return (
              <li key={b.id} className="rounded-xl border border-[#2a2418] bg-black/35">
                <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left text-sm font-semibold text-zinc-200"
                    onClick={() => setOpenId(expanded ? null : b.id)}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{labelFor(b)}</span>
                    <span className="block truncate">{b.title || "Sem título"}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                      aria-label="Subir"
                      onClick={() => move(b.id, -1)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                      aria-label="Descer"
                      onClick={() => move(b.id, 1)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-rose-400/90 hover:bg-rose-500/15"
                      aria-label="Remover bloco"
                      onClick={() => remove(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expanded ? (
                  <div className="border-t border-white/[0.06] px-3 py-3 sm:px-4">
                    <EditorialStatBlockInlineEditor block={b} onReplace={(next) => replaceAt(b.id, next)} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
