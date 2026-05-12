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

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase text-zinc-400">{tip.campeonato}</span>
        <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
          {statusLabel}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-white">{tip.jogo}</h3>

      <p className="text-sm text-zinc-400">{tip.mercado}</p>
      <p className="mt-1 text-sm text-zinc-300">{tip.selecao}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Odd</p>
          <p className="font-bold text-yellow-400">{tip.odd}</p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Confiança</p>
          <p className="font-bold text-white">{tip.confianca}/5</p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Horário</p>
          <p className="font-bold text-white">{tip.horario}</p>
        </div>
      </div>
    </article>
  );
}