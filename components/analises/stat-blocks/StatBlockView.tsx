import type { ReactNode } from "react";
import type { StatBlock } from "@/lib/analises/stat-blocks/types";
import { cn } from "@/lib/utils";

const card =
  "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/95 via-[#0c0b09] to-black/90 p-4 shadow-[0_20px_50px_-36px_rgba(0,0,0,0.9)] sm:p-5";

const kicker = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227]/90";

function pct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}

function norm3(a: number, b: number, c: number): [number, number, number] {
  const s = Math.max(0, a) + Math.max(0, b) + Math.max(0, c);
  if (s <= 0) return [33.33, 33.34, 33.33];
  return [(a / s) * 100, (b / s) * 100, (c / s) * 100];
}

function StatCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(card, className)}>
      {title ? <p className={kicker}>{title}</p> : null}
      {children}
    </div>
  );
}

function Probability1x2({
  block,
  fallbackCasa,
  fallbackFora,
}: {
  block: Extract<StatBlock, { kind: "probability_1x2" }>;
  fallbackCasa: string;
  fallbackFora: string;
}) {
  const [p1, px, p2] = norm3(block.vitoriaCasa, block.empate, block.vitoriaFora);
  const l1 = block.labelCasa?.trim() || fallbackCasa || "Casa";
  const l2 = block.labelFora?.trim() || fallbackFora || "Fora";
  return (
    <StatCard title={block.title}>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-zinc-400">{l1}</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-300">{pct(block.vitoriaCasa)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400">Empate</p>
          <p className="mt-1 font-display text-2xl font-bold text-zinc-200">{pct(block.empate)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400">{l2}</p>
          <p className="mt-1 font-display text-2xl font-bold text-sky-300">{pct(block.vitoriaFora)}</p>
        </div>
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-800/80">
        <span className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${p1}%` }} />
        <span className="h-full bg-zinc-500" style={{ width: `${px}%` }} />
        <span className="h-full bg-gradient-to-r from-sky-500 to-sky-400" style={{ width: `${p2}%` }} />
      </div>
    </StatCard>
  );
}

function FairOdd({ block }: { block: Extract<StatBlock, { kind: "fair_odd" }> }) {
  const delta =
    block.oddMercado != null && Number.isFinite(block.oddMercado)
      ? ((block.oddJusta - block.oddMercado) / block.oddMercado) * 100
      : null;
  return (
    <StatCard title={block.title}>
      <div className="mt-3 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-xs text-zinc-500">Odd justa (modelo)</p>
          <p className="font-mono text-3xl font-black tabular-nums text-[#F5E6A8]">@{block.oddJusta.toFixed(2)}</p>
        </div>
        {block.oddMercado != null ? (
          <div>
            <p className="text-xs text-zinc-500">Mercado</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-300">@{block.oddMercado.toFixed(2)}</p>
          </div>
        ) : null}
        {delta != null ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-bold",
              delta >= 0
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/35 bg-rose-500/10 text-rose-200",
            )}
          >
            Δ {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </div>
        ) : null}
      </div>
      {block.mercado ? <p className="mt-3 text-sm text-zinc-400">{block.mercado}</p> : null}
      {block.nota ? <p className="mt-2 text-xs text-zinc-500">{block.nota}</p> : null}
    </StatCard>
  );
}

function EvPlus({ block }: { block: Extract<StatBlock, { kind: "ev_plus" }> }) {
  const pos = block.evPercent >= 0;
  return (
    <StatCard title={block.title}>
      <div className="mt-2 flex flex-wrap items-baseline gap-3">
        <span
          className={cn(
            "font-display text-4xl font-black tabular-nums",
            pos ? "text-emerald-300" : "text-rose-300",
          )}
        >
          {pos ? "+" : ""}
          {block.evPercent.toFixed(1)}%
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">EV indicativo</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
        {block.probModelo != null ? (
          <p>
            <span className="text-zinc-600">P modelo:</span> {(block.probModelo * 100).toFixed(1)}%
          </p>
        ) : null}
        {block.probImplicita != null ? (
          <p>
            <span className="text-zinc-600">P implícita:</span> {(block.probImplicita * 100).toFixed(1)}%
          </p>
        ) : null}
      </div>
      {block.nota ? <p className="mt-3 text-xs leading-relaxed text-zinc-500">{block.nota}</p> : null}
    </StatCard>
  );
}

function FormStrip({ label, seq }: { label: string; seq: string }) {
  const chars = seq.toUpperCase().replace(/\s/g, "").split("").slice(0, 10);
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {chars.map((ch, i) => (
          <span
            key={`${label}-${i}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-xs font-black",
              ch === "W" && "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-500/40",
              ch === "D" && "bg-zinc-600/40 text-zinc-200 ring-1 ring-zinc-500/40",
              ch === "L" && "bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/35",
              ch === "?" && "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
            )}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}

function FormRecent({
  block,
  fallbackCasa,
  fallbackFora,
}: {
  block: Extract<StatBlock, { kind: "form_recent" }>;
  fallbackCasa: string;
  fallbackFora: string;
}) {
  return (
    <StatCard title={block.title}>
      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        <FormStrip label={fallbackCasa || "Casa"} seq={block.sequenciaCasa} />
        <FormStrip label={fallbackFora || "Fora"} seq={block.sequenciaFora} />
      </div>
    </StatCard>
  );
}

function H2h({ block }: { block: Extract<StatBlock, { kind: "h2h" }> }) {
  return (
    <StatCard title={block.title}>
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead className="bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Resultado</th>
              <th className="px-3 py-2 text-right">Placar</th>
            </tr>
          </thead>
          <tbody>
            {block.linhas.map((ln, i) => (
              <tr key={i} className="border-t border-white/[0.05] text-zinc-300">
                <td className="px-3 py-2 text-xs text-zinc-500">{ln.data ?? "—"}</td>
                <td className="px-3 py-2 font-medium text-zinc-200">{ln.resultado}</td>
                <td className="px-3 py-2 text-right font-mono text-[#E8D48B]">{ln.placar ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StatCard>
  );
}

function ExpectedGoals({ block }: { block: Extract<StatBlock, { kind: "expected_goals" }> }) {
  return (
    <StatCard title={block.title}>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/25">
          <p className="text-[10px] font-bold uppercase text-emerald-400/90">xG casa</p>
          <p className="mt-1 font-mono text-3xl font-black text-emerald-200">{block.xgCasa.toFixed(2)}</p>
          {block.xgaCasa != null ? (
            <p className="mt-1 text-xs text-zinc-500">xGA {block.xgaCasa.toFixed(2)}</p>
          ) : null}
        </div>
        <div className="rounded-xl bg-sky-500/10 p-3 ring-1 ring-sky-500/25">
          <p className="text-[10px] font-bold uppercase text-sky-400/90">xG fora</p>
          <p className="mt-1 font-mono text-3xl font-black text-sky-200">{block.xgFora.toFixed(2)}</p>
          {block.xgaFora != null ? (
            <p className="mt-1 text-xs text-zinc-500">xGA {block.xgaFora.toFixed(2)}</p>
          ) : null}
        </div>
      </div>
    </StatCard>
  );
}

function OverUnder({ block }: { block: Extract<StatBlock, { kind: "over_under" }> }) {
  const t = block.overPercent + block.underPercent;
  const o = t > 0 ? (block.overPercent / t) * 100 : 50;
  return (
    <StatCard title={block.title}>
      <p className="mt-2 text-sm text-zinc-400">
        Linha <span className="font-mono font-bold text-white">{block.linha}</span>
        {block.contexto ? <span className="text-zinc-600"> · {block.contexto}</span> : null}
      </p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-800">
        <span className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${o}%` }} />
        <span className="h-full bg-gradient-to-r from-zinc-600 to-zinc-500" style={{ width: `${100 - o}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold">
        <span className="text-amber-200">Over {pct(block.overPercent)}</span>
        <span className="text-zinc-400">Under {pct(block.underPercent)}</span>
      </div>
    </StatCard>
  );
}

function HeatmapSimple({ block }: { block: Extract<StatBlock, { kind: "heatmap_simple" }> }) {
  const { rows, cols, cells } = block;
  return (
    <StatCard title={block.title}>
      <div
        className="mt-3 grid gap-px rounded-lg bg-zinc-800/80 p-px"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            className="aspect-square min-h-[22px] rounded-[2px]"
            style={{
              backgroundColor: `rgba(201, 162, 39, ${0.12 + c * 0.75})`,
            }}
            title={`intensidade ${(c * 100).toFixed(0)}%`}
          />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">
        {block.labelLinhas ?? `${rows}×${cols}`} heatmap · valores normalizados localmente (placeholder até API).
      </p>
    </StatCard>
  );
}

function CompareChart({ block }: { block: Extract<StatBlock, { kind: "compare_chart" }> }) {
  return (
    <StatCard title={block.title}>
      <div className="mt-4 space-y-4">
        {block.metricas.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs text-zinc-500">
              <span className="font-semibold text-zinc-300">{m.label}</span>
              <span>
                <span className="text-emerald-300">{m.casa}</span>
                <span className="mx-1 text-zinc-600">/</span>
                <span className="text-sky-300">{m.fora}</span>
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  style={{ width: `${Math.min(100, m.casa)}%` }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400"
                  style={{ width: `${Math.min(100, m.fora)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </StatCard>
  );
}

function ConfidenceBar({ block }: { block: Extract<StatBlock, { kind: "confidence_bar" }> }) {
  const v = Math.min(100, Math.max(0, block.value));
  return (
    <StatCard title={block.title}>
      <div className="mt-3">
        <div className="flex items-end justify-between">
          <span className="font-display text-4xl font-black text-[#F5E6A8]">{Math.round(v)}</span>
          <span className="pb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">/ 100</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-700 via-[#C9A227] to-amber-300"
            style={{ width: `${v}%` }}
          />
        </div>
        {block.subtitulo ? <p className="mt-2 text-xs text-zinc-500">{block.subtitulo}</p> : null}
      </div>
    </StatCard>
  );
}

export function StatBlockView({
  block,
  timeCasa,
  timeFora,
}: {
  block: StatBlock;
  timeCasa: string;
  timeFora: string;
}) {
  const casa = timeCasa.trim() || "Casa";
  const fora = timeFora.trim() || "Fora";
  switch (block.kind) {
    case "probability_1x2":
      return <Probability1x2 block={block} fallbackCasa={casa} fallbackFora={fora} />;
    case "fair_odd":
      return <FairOdd block={block} />;
    case "ev_plus":
      return <EvPlus block={block} />;
    case "form_recent":
      return <FormRecent block={block} fallbackCasa={casa} fallbackFora={fora} />;
    case "h2h":
      return <H2h block={block} />;
    case "expected_goals":
      return <ExpectedGoals block={block} />;
    case "over_under":
      return <OverUnder block={block} />;
    case "heatmap_simple":
      return <HeatmapSimple block={block} />;
    case "compare_chart":
      return <CompareChart block={block} />;
    case "confidence_bar":
      return <ConfidenceBar block={block} />;
    default: {
      const _e: never = block;
      void _e;
      return null;
    }
  }
}
