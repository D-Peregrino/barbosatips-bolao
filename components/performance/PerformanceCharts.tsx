"use client";

import type { Dia30, PontoAcumulado, PontoRoi, SemanaBar } from "@/lib/picks/performance-compute";

const W = 920;
const H = 260;
const PAD_L = 52;
const PAD_R = 28;
const PAD_T = 28;
const PAD_B = 52;

function polylinePoints(
  series: PontoAcumulado[],
  key: "greensCum" | "redsCum",
  maxY: number,
): string {
  if (series.length === 0) return "";
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const n = series.length;
  return series
    .map((p, i) => {
      const x = PAD_L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const v = p[key];
      const y = PAD_T + innerH - (maxY > 0 ? (v / maxY) * innerH : 0);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function polylineRoi(series: PontoRoi[]): string {
  if (series.length === 0) return "";
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const vals = series.map((p) => p.lucroCum);
  const minV = Math.min(0, ...vals);
  const maxV = Math.max(0.01, ...vals);
  const span = maxV - minV || 1;
  const n = series.length;
  return series
    .map((p, i) => {
      const x = PAD_L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = PAD_T + innerH - ((p.lucroCum - minV) / span) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function WeeklyBars({ data }: { data: SemanaBar[] }) {
  const Wb = 920;
  const Hb = 220;
  const pad = 44;
  const innerW = Wb - pad * 2;
  const n = data.length || 1;
  const maxH = Math.max(
    1,
    ...data.map((d) => Math.max(d.greens + d.reds + d.voids, d.greens + d.reds)),
  );
  const gap = 4;
  const barSlot = (innerW - gap * (n - 1)) / n;
  const wGreen = barSlot * 0.38;
  const wRed = barSlot * 0.38;
  const wVoid = barSlot * 0.2;

  return (
    <svg
      viewBox={`0 0 ${Wb} ${Hb}`}
      className="h-auto w-full max-w-full"
      role="img"
      aria-label="Desempenho semanal: greens e reds por semana"
    >
      <defs>
        <linearGradient id="wk-barG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="wk-barR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={Wb} height={Hb} fill="transparent" />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad + (Hb - pad * 2) * (1 - t);
        return (
          <line
            key={t}
            x1={pad}
            x2={Wb - pad}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        );
      })}
      {data.map((d, i) => {
        const x0 = pad + i * (barSlot + gap);
        const baseY = Hb - pad;
        const hG = (d.greens / maxH) * (Hb - pad * 2);
        const hR = (d.reds / maxH) * (Hb - pad * 2);
        const hV = (d.voids / maxH) * (Hb - pad * 2);
        return (
          <g key={d.key}>
            <rect
              x={x0}
              y={baseY - hG}
              width={wGreen}
              height={Math.max(hG, 0)}
              rx={3}
              fill="url(#wk-barG)"
              className="transition-opacity hover:opacity-90"
            />
            <rect
              x={x0 + wGreen + 2}
              y={baseY - hR}
              width={wRed}
              height={Math.max(hR, 0)}
              rx={3}
              fill="url(#wk-barR)"
              className="transition-opacity hover:opacity-90"
            />
            <rect
              x={x0 + wGreen + wRed + 6}
              y={baseY - hV}
              width={wVoid}
              height={Math.max(hV, 0)}
              rx={2}
              fill="rgba(148,163,184,0.35)"
            />
            {n <= 16 ? (
              <text
                x={x0 + barSlot / 2}
                y={Hb - 12}
                textAnchor="middle"
                fill="rgba(212,175,55,0.75)"
                fontSize={9}
                fontWeight={700}
              >
                {d.label.replace("Sem. ", "S")}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function Last30DaysBars({ data }: { data: Dia30[] }) {
  const Wb = 920;
  const Hb = 240;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 36;
  const innerW = Wb - padL - padR;
  const innerH = Hb - padT - padB;
  const n = data.length || 1;
  const maxH = Math.max(
    1,
    ...data.map((d) => d.greens + d.reds + d.voids),
  );
  const gap = 2;
  const barSlot = (innerW - gap * (n - 1)) / n;
  const wG = barSlot * 0.34;
  const wR = barSlot * 0.34;
  const wV = Math.max(barSlot - wG - wR - 6, 2);

  return (
    <svg
      viewBox={`0 0 ${Wb} ${Hb}`}
      className="h-auto w-full max-w-full"
      role="img"
      aria-label="Últimos 30 dias: greens, reds e voids por dia"
    >
      <defs>
        <linearGradient id="d30-barG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="d30-barR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0.88" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => {
        const y = padT + innerH * (1 - t);
        return (
          <line
            key={t}
            x1={padL}
            x2={Wb - padR}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
          />
        );
      })}
      {data.map((d, i) => {
        const x0 = padL + i * (barSlot + gap);
        const baseY = padT + innerH;
        const hG = (d.greens / maxH) * innerH;
        const hR = (d.reds / maxH) * innerH;
        const hV = (d.voids / maxH) * innerH;
        const showLabel = n <= 18 || i % Math.ceil(n / 12) === 0 || i === n - 1;
        return (
          <g key={d.key}>
            <rect
              x={x0}
              y={baseY - hG}
              width={wG}
              height={Math.max(hG, 0)}
              rx={2}
              fill="url(#d30-barG)"
            />
            <rect
              x={x0 + wG + 1}
              y={baseY - hR}
              width={wR}
              height={Math.max(hR, 0)}
              rx={2}
              fill="url(#d30-barR)"
            />
            <rect
              x={x0 + wG + wR + 3}
              y={baseY - hV}
              width={wV}
              height={Math.max(hV, 0)}
              rx={1.5}
              fill="rgba(148,163,184,0.32)"
            />
            {showLabel ? (
              <text
                x={x0 + barSlot / 2}
                y={Hb - 8}
                textAnchor="middle"
                fill="rgba(161,161,170,0.85)"
                fontSize={7}
                fontWeight={600}
              >
                {d.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export type PerformanceChartsProps = {
  serieGreensReds: PontoAcumulado[];
  serieRoi: PontoRoi[];
  semanal: SemanaBar[];
  diarioTrintaDias: Dia30[];
};

export function PerformanceCharts({
  serieGreensReds,
  serieRoi,
  semanal,
  diarioTrintaDias,
}: PerformanceChartsProps) {
  const maxY =
    serieGreensReds.length > 0
      ? Math.max(
          1,
          ...serieGreensReds.map((p) => Math.max(p.greensCum, p.redsCum)),
        )
      : 1;

  const plG = polylinePoints(serieGreensReds, "greensCum", maxY);
  const plR = polylinePoints(serieGreensReds, "redsCum", maxY);
  const plRoi = polylineRoi(serieRoi);

  const semanalSlice = semanal.slice(-24);

  return (
    <div className="space-y-10">
      <figure className="commercial-card-elevated overflow-hidden p-4 sm:p-6">
        <figcaption className="mb-4 flex flex-col gap-1 border-b border-amber-500/15 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Últimos 30 dias
            </h3>
            <p className="text-xs text-zinc-500">
              Volume diário de resultados (encerradas) · fuso America/Sao_Paulo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span className="text-emerald-400">Green</span>
            <span className="text-red-400">Red</span>
            <span className="text-slate-400">Void</span>
          </div>
        </figcaption>
        {diarioTrintaDias.every((d) => d.greens + d.reds + d.voids === 0) ? (
          <p className="py-14 text-center text-sm text-zinc-500">
            Neste período ainda não há resultados encerrados para mostrar no gráfico.
          </p>
        ) : (
          <Last30DaysBars data={diarioTrintaDias} />
        )}
      </figure>

      <div className="grid gap-8 lg:grid-cols-2">
        <figure className="commercial-card-elevated overflow-hidden p-4 sm:p-6">
          <figcaption className="mb-4 flex flex-col gap-1 border-b border-amber-500/15 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Evolução acumulada
              </h3>
              <p className="text-xs text-zinc-500">
                Greens e reds ao longo do tempo (picks encerradas).
              </p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="text-emerald-400">● Green</span>
              <span className="text-red-400">● Red</span>
            </div>
          </figcaption>
          {serieGreensReds.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              Ainda não há sequência suficiente de greens/reds para o gráfico.
            </p>
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full max-w-full"
              role="img"
              aria-label="Gráfico de evolução de greens e reds"
            >
              <defs>
                <filter id="softGlowLines" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width={W} height={H} fill="rgba(0,0,0,0.2)" rx={8} />
              {[0, 0.5, 1].map((t) => {
                const innerH = H - PAD_T - PAD_B;
                const y = PAD_T + innerH * (1 - t);
                return (
                  <line
                    key={t}
                    x1={PAD_L}
                    x2={W - PAD_R}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                  />
                );
              })}
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={plG}
                filter="url(#softGlowLines)"
              />
              <polyline
                fill="none"
                stroke="#f87171"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={plR}
              />
              <text
                x={PAD_L}
                y={H - 12}
                fill="rgba(161,161,170,0.9)"
                fontSize={11}
              >
                {serieGreensReds[0]?.label ?? ""} →{" "}
                {serieGreensReds[serieGreensReds.length - 1]?.label ?? ""}
              </text>
            </svg>
          )}
        </figure>

        <figure className="commercial-card-elevated overflow-hidden p-4 sm:p-6">
          <figcaption className="mb-4 border-b border-amber-500/15 pb-3">
            <h3 className="font-display text-lg font-bold text-white">
              Linha de lucro (ROI em 1u)
            </h3>
            <p className="text-xs text-zinc-500">
              Green: odd−1 · Red: −1 · Void: 0 (não altera acumulado nesta curva).
            </p>
          </figcaption>
          {serieRoi.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              Sem apostas encerradas com green/red para desenhar a curva.
            </p>
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full max-w-full"
              role="img"
              aria-label="Gráfico de lucro acumulado"
            >
              <defs>
                <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <filter id="softGlowRoi" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width={W} height={H} fill="rgba(0,0,0,0.2)" rx={8} />
              <polyline
                fill="none"
                stroke="url(#goldLine)"
                strokeWidth={2.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={plRoi}
                filter="url(#softGlowRoi)"
              />
              <text
                x={PAD_L}
                y={H - 12}
                fill="rgba(212,175,55,0.85)"
                fontSize={11}
                fontWeight={600}
              >
                Final: {serieRoi[serieRoi.length - 1]?.lucroCum ?? 0} u · ROI médio{" "}
                {serieRoi[serieRoi.length - 1]?.roiPorApostaPct ?? 0}%
              </text>
            </svg>
          )}
        </figure>
      </div>

      <figure className="commercial-card-elevated overflow-hidden p-4 sm:p-6">
        <figcaption className="mb-4 flex flex-col gap-1 border-b border-amber-500/15 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Desempenho semanal
            </h3>
            <p className="text-xs text-zinc-500">
              Últimas semanas (ISO, fuso America/Sao_Paulo) · verde · vermelho · cinza void.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span className="text-emerald-400">Green</span>
            <span className="text-red-400">Red</span>
            <span className="text-slate-400">Void</span>
          </div>
        </figcaption>
        {semanalSlice.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            Sem dados semanais ainda.
          </p>
        ) : (
          <WeeklyBars data={semanalSlice} />
        )}
      </figure>
    </div>
  );
}
