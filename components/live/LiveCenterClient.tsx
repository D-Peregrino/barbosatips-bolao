"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveBadge } from "@/components/live/LiveBadge";
import type { LiveSummaryPayload } from "@/lib/live/types";
import { cn } from "@/lib/utils";

const POLL_MS = 40_000;

async function fetchSummary(): Promise<LiveSummaryPayload | null> {
  try {
    const res = await fetch("/api/live/summary", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as LiveSummaryPayload;
  } catch {
    return null;
  }
}

function kindDot(kind: LiveSummaryPayload["activity"][number]["kind"]): string {
  switch (kind) {
    case "green":
      return "bg-emerald-400";
    case "red":
      return "bg-rose-400";
    case "analise":
      return "bg-sky-400";
    case "ativo":
      return "bg-amber-400";
    default:
      return "bg-zinc-400";
  }
}

export type LiveCenterClientProps = {
  initialSummary: LiveSummaryPayload;
  children: ReactNode;
};

/**
 * Atualiza métricas e listas leves por polling; o bloco `children` (SSR) permanece estável.
 */
export function LiveCenterClient({
  initialSummary,
  children,
}: LiveCenterClientProps) {
  const [summary, setSummary] = useState(initialSummary);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    const next = await fetchSummary();
    if (next) setSummary(next);
  }, []);

  useEffect(() => {
    pollRef.current = setInterval(() => void load(), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const taxa =
    summary.performance.taxaAcertoPct != null
      ? `${summary.performance.taxaAcertoPct.toFixed(1)}%`
      : "—";

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Greens (amostra recente)"
          value={String(summary.counts.greens)}
          hint="Quick picks encerradas na janela pública."
        />
        <MetricCard
          label="Reds"
          value={String(summary.counts.reds)}
          hint="Incluído no cálculo de taxa e sequência."
        />
        <MetricCard
          label="Taxa de acerto"
          value={taxa}
          hint="Sobre picks encerradas green+red."
        />
        <MetricCard
          label="Melhor sequência green"
          value={String(summary.performance.bestGreenStreak)}
          hint={`Streak atual: ${
            summary.performance.streakAtual > 0 ? "+" : ""
          }${summary.performance.streakAtual}`}
        />
      </section>

      <section className="rounded-2xl border border-amber-500/18 bg-gradient-to-br from-zinc-900/55 via-black/90 to-zinc-950/80 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-400/95">
              Atividade recente
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Atualizado automaticamente · sem refresh manual
            </p>
          </div>
          <p className="font-mono text-[10px] text-zinc-600">
            {new Date(summary.updatedAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
        <ul className="mt-5 space-y-3">
          {summary.activity.map((a) => (
            <li
              key={a.id}
              className="flex gap-3 rounded-xl border border-white/6 bg-black/35 px-3 py-2.5 text-sm text-zinc-200"
            >
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  kindDot(a.kind),
                )}
                aria-hidden
              />
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-500/15 bg-black/40 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">
            Trending agora
          </h2>
          <div className="flex flex-wrap gap-2">
            <LiveBadge variant="hot" />
            <LiveBadge variant="premium" />
          </div>
        </div>
        <ul className="mt-5 divide-y divide-white/6">
          {summary.trending.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <Link
                href={`/pick/${encodeURIComponent(p.id)}`}
                className="min-w-0 flex-1 font-medium text-cream hover:text-gold-200"
              >
                <span className="block truncate">{p.jogo}</span>
                <span className="mt-0.5 block truncate text-xs text-zinc-500">
                  {p.mercado} · @{p.odd.toFixed(2)}
                </span>
              </Link>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                {p.badges.map((b) => (
                  <LiveBadge
                    key={b}
                    variant={b === "HOT" ? "hot" : "premium"}
                  />
                ))}
                {p.status === "ativo" ? <LiveBadge variant="live" /> : null}
                {p.status === "encerrado" && p.resultado === "green" ? (
                  <LiveBadge variant="green" />
                ) : null}
                {p.status === "encerrado" && p.resultado === "red" ? (
                  <LiveBadge variant="red" />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {children}
    </div>
  );
}

function MetricCard(props: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/50 p-4 shadow-inner">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        {props.label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
        {props.value}
      </p>
      <p className="mt-2 text-[11px] leading-snug text-zinc-500">{props.hint}</p>
    </div>
  );
}
