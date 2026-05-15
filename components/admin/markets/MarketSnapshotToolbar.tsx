"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, Loader2, Save } from "lucide-react";
import { saveMarketEvSnapshotAction } from "@/app/admin/(panel)/mercados/actions";
import type { MarketEvSnapshotSummary } from "@/lib/betting/market-ev-snapshots";
import { cn } from "@/lib/utils";

type Props = {
  summary: MarketEvSnapshotSummary;
};

export function MarketSnapshotToolbar({ summary }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [localSummary, setLocalSummary] = useState(summary);

  const lastLabel = localSummary.lastSavedAt
    ? format(new Date(localSummary.lastSavedAt), "dd MMM yyyy · HH:mm", { locale: ptBR })
    : "Nunca";

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveMarketEvSnapshotAction();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setLocalSummary((prev) => ({
        ...prev,
        lastSavedAt: result.savedAt,
        savedTodayCount: prev.savedTodayCount + result.inserted,
        snapshotDate: result.snapshotDate,
      }));
      const parts = [
        `${result.inserted} mercado${result.inserted === 1 ? "" : "s"} guardado${result.inserted === 1 ? "" : "s"}`,
      ];
      if (result.skipped > 0) {
        parts.push(`${result.skipped} ignorado${result.skipped === 1 ? "" : "s"} (já existiam hoje)`);
      }
      setMessage(parts.join(" · "));
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold-400/12 bg-[#0c0b09]/80 p-4">
      <div className="space-y-1 text-sm">
        <p className="text-stone-400">
          Último snapshot:{" "}
          <span className="font-medium text-gold-200/90">{lastLabel}</span>
        </p>
        <p className="text-xs text-stone-500">
          {localSummary.savedTodayCount} mercado
          {localSummary.savedTodayCount === 1 ? "" : "s"} salvos em {localSummary.snapshotDate}
        </p>
        {message && (
          <p className={cn("text-xs", message.includes("ignorado") ? "text-amber-300/90" : "text-emerald-400/90")}>
            {message}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/mercados/historico"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900/80 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-gold-400/25 hover:text-white"
        >
          <History className="h-4 w-4" aria-hidden />
          Histórico
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-500/25 to-amber-600/15 px-4 py-2 text-sm font-semibold text-gold-50 ring-1 ring-gold-400/35 transition hover:from-gold-500/35 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Salvar snapshot
        </button>
      </div>
    </div>
  );
}
