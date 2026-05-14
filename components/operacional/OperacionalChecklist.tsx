"use client";

import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";

const STORAGE_KEY = "barbosa-operacional-checklist-v1";

const ITEMS = [
  { id: "pick", label: "Postar pick" },
  { id: "analise", label: "Publicar análise" },
  { id: "greenred", label: "Atualizar green / red" },
  { id: "telegram", label: "Postar Telegram" },
  { id: "youtube", label: "Postar YouTube" },
] as const;

function loadState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function OperacionalChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDone(loadState());
  }, []);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ul className="space-y-2">
      {ITEMS.map((it) => {
        const checked = Boolean(done[it.id]);
        return (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => toggle(it.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                checked
                  ? "border-emerald-500/35 bg-emerald-950/25 text-emerald-100/95"
                  : "border-white/10 bg-black/30 text-zinc-300 hover:border-gold-400/25"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  checked
                    ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                    : "border-zinc-600 bg-zinc-900 text-zinc-600"
                }`}
                aria-hidden
              >
                {checked ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
              </span>
              {it.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
