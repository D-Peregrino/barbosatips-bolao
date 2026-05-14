"use client";

export type TipCardData = {
  id: string;
  esporte: string;
  campeonato: string;
  jogo: string;
  mercado: string;
  selecao: string;
  odd: number;
  confianca: 1 | 2 | 3 | 4 | 5;
  horario: string;
  status: "win" | "loss" | "push" | "pending";
};

export function TipCard({ tip }: { tip: TipCardData }) {
  const statusLabel =
    tip.status === "win"
      ? "Green"
      : tip.status === "loss"
        ? "Red"
        : tip.status === "push"
          ? "Push"
          : "Pendente";

  const statusBadgeClass =
    tip.status === "win"
      ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-200"
      : tip.status === "loss"
        ? "border-red-500/45 bg-red-500/12 text-red-200"
        : tip.status === "push"
          ? "border-slate-500/45 bg-slate-500/15 text-slate-200"
          : "border-amber-500/45 bg-amber-500/15 text-amber-100";

  return (
    <article className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-zinc-900/80 via-pitch-900/90 to-pitch-950 p-5 shadow-[0_20px_50px_-24px_rgba(0,0,0,.65)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs uppercase text-zinc-400">{tip.campeonato}</span>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusBadgeClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-white">{tip.jogo}</h3>

      <p className="text-sm text-zinc-400">{tip.mercado}</p>
      <p className="mt-1 text-sm text-zinc-300">{tip.selecao}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-zinc-700/50 bg-black/25 p-3">
          <p className="text-xs text-zinc-500">Odd</p>
          <p className="font-bold text-yellow-400">{tip.odd}</p>
        </div>

        <div className="rounded-xl border border-zinc-700/50 bg-black/25 p-3">
          <p className="text-xs text-zinc-500">Confiança</p>
          <p className="font-bold text-white">{tip.confianca}/5</p>
        </div>

        <div className="rounded-xl border border-zinc-700/50 bg-black/25 p-3">
          <p className="text-xs text-zinc-500">Horário</p>
          <p className="font-bold text-white">{tip.horario}</p>
        </div>
      </div>
    </article>
  );
}