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
      ? "border-emerald-400/45 bg-emerald-500/12 text-emerald-100"
      : tip.status === "loss"
        ? "border-rose-400/40 bg-rose-950/40 text-rose-100"
        : tip.status === "push"
          ? "border-stone-500/45 bg-stone-800/35 text-stone-200"
          : "border-gold-400/40 bg-gold-400/10 text-gold-100";

  return (
    <article className="commercial-card-elevated rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/28">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-stone-500">{tip.campeonato}</span>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusBadgeClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <h3 className="mb-2 font-display text-xl font-bold text-cream">{tip.jogo}</h3>

      <p className="text-sm text-stone-500">{tip.mercado}</p>
      <p className="mt-1 text-sm text-cream-muted">{tip.selecao}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-gold-400/15 bg-black/35 p-3">
          <p className="text-xs text-stone-500">Odd</p>
          <p className="font-mono text-lg font-extrabold tabular-nums text-gold-200">{tip.odd}</p>
        </div>

        <div className="rounded-xl border border-gold-400/10 bg-black/25 p-3">
          <p className="text-xs text-stone-500">Confiança</p>
          <p className="font-bold text-cream">{tip.confianca}/5</p>
        </div>

        <div className="rounded-xl border border-gold-400/10 bg-black/25 p-3">
          <p className="text-xs text-stone-500">Horário</p>
          <p className="font-bold text-cream-muted">{tip.horario}</p>
        </div>
      </div>
    </article>
  );
}
