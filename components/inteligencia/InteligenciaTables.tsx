"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type {
  ComparisonMetric,
  CorrectScoreCell,
  EvPositiveRow,
  FairOddsRow,
  InteligenciaSnapshot,
  OutcomeProb,
} from "@/lib/inteligencia/types";

function Th({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={`border-b border-zinc-800/90 bg-zinc-950/80 px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 ${className ?? ""}`}
      {...rest}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  accent,
}: {
  children: ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <td
      className={`border-b border-zinc-900/90 px-3 py-2 text-[13px] ${
        mono ? "font-mono text-[12px]" : ""
      } ${accent ? "text-emerald-300/95" : "text-zinc-200"}`}
    >
      {children}
    </td>
  );
}

export function FairOddsTable({ rows }: { rows: FairOddsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/90 bg-zinc-950/40">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            <Th>Mercado</Th>
            <Th>Linha</Th>
            <Th>Implícita livro</Th>
            <Th>Justa (modelo)</Th>
            <Th>Edge</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-white/[0.03]">
              <Td>{r.market}</Td>
              <Td mono>{r.selection}</Td>
              <Td mono>{(r.bookImplied * 100).toFixed(1)}%</Td>
              <Td mono>{(r.fairImplied * 100).toFixed(1)}%</Td>
              <Td mono accent={r.edgePct >= 3}>
                {r.edgePct >= 0 ? "+" : ""}
                {r.edgePct.toFixed(1)}%
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EvPositiveTable({ rows }: { rows: EvPositiveRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-emerald-950/10">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            <Th>Mercado</Th>
            <Th>P(modelo)</Th>
            <Th>Melhor odd</Th>
            <Th>Implícita odd</Th>
            <Th>EV</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-emerald-500/[0.04]">
              <Td>{r.market}</Td>
              <Td mono>{(r.fairProb * 100).toFixed(1)}%</Td>
              <Td mono>{r.bestOdds.toFixed(2)}</Td>
              <Td mono>{(r.impliedFromOdds * 100).toFixed(1)}%</Td>
              <Td mono accent={r.evPct > 0}>
                {r.evPct > 0 ? "+" : ""}
                {r.evPct.toFixed(1)}%
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProbabilityBlocks({
  blocks,
}: {
  blocks: InteligenciaSnapshot["probabilities"];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {blocks.map((b) => (
        <div
          key={b.blockTitle}
          className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-4 ring-1 ring-white/[0.02]"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {b.blockTitle}
          </p>
          <ul className="mt-3 space-y-2">
            {b.outcomes.map((o: OutcomeProb) => (
              <li key={o.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-200">{o.label}</span>
                <div className="flex min-w-[120px] flex-1 items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500/80 to-gold-400/80"
                      style={{ width: `${Math.min(100, o.prob * 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-gold-200/90">
                    {(o.prob * 100).toFixed(0)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function CorrectScoreGrid({ cells }: { cells: CorrectScoreCell[] }) {
  const maxPct = Math.max(...cells.map((c) => c.pct), 1);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cells.map((c, idx) => (
        <div
          key={`${c.home}-${c.away}-${idx}`}
          className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5 font-mono text-xs text-zinc-200 ring-1 ring-white/[0.02]"
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">
              {c.home}-{c.away}
            </span>
            <span className="text-gold-200/90">
              {c.pct >= maxPct - 1e-6 ? "★ " : ""}
              {c.pct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-violet-500/70"
              style={{ width: `${(c.pct / maxPct) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComparatorTable({
  metrics,
  leftLabel,
  rightLabel,
}: {
  metrics: ComparisonMetric[];
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/90 bg-zinc-950/40">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            <Th>Métrica</Th>
            <Th className="max-w-[120px] truncate" title={leftLabel}>
              {leftLabel}
            </Th>
            <Th className="max-w-[120px] truncate" title={rightLabel}>
              {rightLabel}
            </Th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.key} className="hover:bg-white/[0.03]">
              <Td>{m.key}</Td>
              <Td mono accent={m.lean === "left"}>
                {m.left}
                {m.unit ? ` ${m.unit}` : ""}
              </Td>
              <Td mono accent={m.lean === "right"}>
                {m.right}
                {m.unit ? ` ${m.unit}` : ""}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
