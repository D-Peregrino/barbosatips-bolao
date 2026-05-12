"use client";

import type { BolaoJogoPalpiteMock } from "@/lib/mocks/bolao-palpites.mock";

export interface PalpiteJogoCardProps {
  jogo: BolaoJogoPalpiteMock;
  placarCasa: string;
  placarVisitante: string;
  onPlacarChange: (jogoId: string, campo: "casa" | "fora", valor: string) => void;
}

function formatarDataCurta(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PalpiteJogoCard({
  jogo,
  placarCasa,
  placarVisitante,
  onPlacarChange,
}: PalpiteJogoCardProps) {
  const { id, mandante, visitante, competicao } = jogo;

  return (
    <article
      className="rounded-xl border border-pitch-700 bg-pitch-900/90 p-4 shadow-card sm:p-5"
      style={{ borderColor: "rgba(245, 158, 11, 0.12)" }}
    >
      <div className="mb-3 flex flex-col gap-1 border-b border-pitch-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/90">
          {competicao}
        </p>
        <time
          dateTime={jogo.dataISO}
          className="text-[11px] text-neutral-500"
        >
          {formatarDataCurta(jogo.dataISO)}
        </time>
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Mandante */}
        <div className="min-w-0 flex-1 text-center sm:text-right">
          <span className="font-display text-base font-bold leading-tight text-white sm:text-lg">
            {mandante}
          </span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-neutral-500 sm:hidden">
            Casa
          </span>
        </div>

        {/* Placar */}
        <div className="flex shrink-0 items-center justify-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor={`palpite-casa-${id}`}>
            Gols {mandante}
          </label>
          <input
            id={`palpite-casa-${id}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="—"
            value={placarCasa}
            onChange={(e) => onPlacarChange(id, "casa", e.target.value)}
            className="h-12 w-14 rounded-lg border border-pitch-600 bg-pitch-950 text-center font-mono text-xl font-bold text-gold outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30 sm:h-14 sm:w-16 sm:text-2xl"
            maxLength={2}
          />
          <span className="select-none font-display text-lg font-bold text-neutral-600 sm:text-xl">
            ×
          </span>
          <label className="sr-only" htmlFor={`palpite-fora-${id}`}>
            Gols {visitante}
          </label>
          <input
            id={`palpite-fora-${id}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="—"
            value={placarVisitante}
            onChange={(e) => onPlacarChange(id, "fora", e.target.value)}
            className="h-12 w-14 rounded-lg border border-pitch-600 bg-pitch-950 text-center font-mono text-xl font-bold text-gold outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30 sm:h-14 sm:w-16 sm:text-2xl"
            maxLength={2}
          />
        </div>

        {/* Visitante */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <span className="font-display text-base font-bold leading-tight text-white sm:text-lg">
            {visitante}
          </span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-neutral-500 sm:hidden">
            Fora
          </span>
        </div>
      </div>
    </article>
  );
}
