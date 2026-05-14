"use client";

import type { HeatmapZone, TrendSeries, XgSplit } from "@/lib/inteligencia/types";

type Pitch = { w: number; h: number };

export function HeatmapSvg({
  zones,
  pitch,
  className,
}: {
  zones: HeatmapZone[];
  pitch: Pitch;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${pitch.w} ${pitch.h}`}
      className={className}
      role="img"
      aria-label="Heatmap de intensidade"
    >
      <defs>
        <linearGradient id="intel-hm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(52,211,153,0.25)" />
          <stop offset="100%" stopColor="rgba(201,162,39,0.35)" />
        </linearGradient>
      </defs>
      <rect width={pitch.w} height={pitch.h} fill="rgba(6,8,10,0.85)" stroke="rgba(201,162,39,0.2)" strokeWidth="0.4" />
      {zones.map((z) => (
        <g key={z.id}>
          <rect
            x={z.x}
            y={z.y}
            width={z.w}
            height={z.h}
            fill="url(#intel-hm)"
            opacity={0.15 + z.intensity * 0.75}
            stroke="rgba(201,162,39,0.35)"
            strokeWidth="0.35"
            rx="0.8"
          />
        </g>
      ))}
    </svg>
  );
}

export function XgBarsChart({ splits, maxOverride }: { splits: XgSplit[]; maxOverride?: number }) {
  const max = maxOverride ?? Math.max(1, ...splits.map((s) => s.xg));
  return (
    <div className="space-y-4">
      {splits.map((s) => (
        <div key={s.team}>
          <div className="mb-1 flex justify-between font-mono text-[11px] text-zinc-400">
            <span className="text-zinc-200">{s.team}</span>
            <span>
              xG {s.xg.toFixed(2)} · {s.shots} remates · {s.onTarget} à baliza
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500/90 to-gold-400/90"
              style={{ width: `${Math.min(100, (s.xg / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function formColor(v: number): string {
  if (v > 0) return "#34d399";
  if (v < 0) return "#fb7185";
  return "#a1a1aa";
}

export function FormSparkRow({
  label,
  points,
}: {
  label: string;
  points: { label: string; value: number }[];
}) {
  const w = 220;
  const h = 36;
  const pad = 4;
  const step = (w - pad * 2) / Math.max(1, points.length - 1);
  const d = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h / 2 - (p.value * (h / 2 - 6));
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-[220px] shrink-0">
        <path d={d} fill="none" stroke="rgba(201,162,39,0.45)" strokeWidth="1.2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={p.label}
            cx={pad + i * step}
            cy={h / 2 - p.value * (h / 2 - 6)}
            r="3.2"
            fill={formColor(p.value)}
            stroke="#0a0a0a"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    </div>
  );
}

export function TrendMultiChart({ series }: { series: TrendSeries[] }) {
  const w = 320;
  const h = 120;
  const padX = 28;
  const padY = 14;
  const allV = series.flatMap((s) => s.points.map((p) => p.v));
  const minV = Math.min(...allV);
  const maxV = Math.max(...allV);
  const span = Math.max(1e-6, maxV - minV);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full max-w-[320px]">
      <rect x="0" y="0" width={w} height={h} fill="transparent" />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padY + t * (h - padY * 2);
        return (
          <line
            key={t}
            x1={padX}
            y1={y}
            x2={w - 8}
            y2={y}
            stroke="rgba(63,63,70,0.45)"
            strokeWidth="0.6"
            strokeDasharray="3 4"
          />
        );
      })}
      {series.map((s) => {
        const pts = s.points;
        const step = (w - padX - 12) / Math.max(1, pts.length - 1);
        const d = pts
          .map((p, i) => {
            const x = padX + i * step;
            const y = padY + (1 - (p.v - minV) / span) * (h - padY * 2);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
          })
          .join(" ");
        return (
          <path
            key={s.id}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            opacity={0.95}
          />
        );
      })}
    </svg>
  );
}
