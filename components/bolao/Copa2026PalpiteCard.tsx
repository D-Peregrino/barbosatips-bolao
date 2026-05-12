"use client";

import type {
  JogoCopa2026Resolvido,
  StatusPalpiteJogo,
} from "@/lib/mocks/copa2026-groupstage.mock";

function badgeStatus(status: StatusPalpiteJogo) {
  const base =
    "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider";
  if (status === "aberto") {
    return `${base} bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30`;
  }
  if (status === "quase") {
    return `${base} bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/35`;
  }
  return `${base} bg-zinc-700/40 text-zinc-500 ring-1 ring-zinc-600/50`;
}

function labelStatus(status: StatusPalpiteJogo) {
  if (status === "aberto") return "Aberto";
  if (status === "quase") return "Quase";
  return "Encerrado";
}

function formatarData(dataISO: string): string {
  try {
    return new Date(`${dataISO}T12:00:00`).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dataISO;
  }
}

export interface Copa2026PalpiteCardProps {
  jogo: JogoCopa2026Resolvido;
  placarCasa: string;
  placarVisitante: string;
  onPlacarChange: (jogoId: string, campo: "casa" | "fora", valor: string) => void;
  onSalvarPalpite: (jogoId: string) => void;
  salvoFlash: boolean;
  bloquearEdicao?: boolean;
}

export function Copa2026PalpiteCard({
  jogo,
  placarCasa,
  placarVisitante,
  onPlacarChange,
  onSalvarPalpite,
  salvoFlash,
  bloquearEdicao,
}: Copa2026PalpiteCardProps) {
  const {
    id,
    grupo,
    dataISO,
    horario,
    estadio,
    cidade,
    status,
    mandante,
    visitante,
  } = jogo;
  const encerrado = status === "encerrado" || bloquearEdicao;

  return (
    <div className="border border-[#1f1f1f] bg-[#101010] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex flex-col gap-1 border-b border-[#252525] bg-[#0a0a0a] px-2.5 py-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-500">
          <span className="font-black uppercase tracking-wide text-yellow-500/90">
            Grupo {grupo}
          </span>
          <span className="text-zinc-600" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-zinc-400">
            {formatarData(dataISO)} · {horario}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={badgeStatus(status)}>{labelStatus(status)}</span>
        </div>
      </div>

      <div className="border-b border-[#1a1a1a] px-2.5 py-1 text-[9px] leading-tight text-zinc-500">
        <span className="text-zinc-400">{estadio}</span>
        <span className="text-zinc-600" aria-hidden="true">
          {" "}
          ·{" "}
        </span>
        <span className="text-zinc-500">{cidade}</span>
      </div>

      <div className="px-2.5 py-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[38%]">
            <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
              {mandante.bandeira}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold leading-tight text-zinc-100 sm:text-[13px]">
                {mandante.nome}
              </p>
              <p className="text-[9px] text-zinc-500">
                Ranking FIFA{" "}
                <span className="font-mono font-semibold text-yellow-500/90">
                  #{mandante.rankingFifa}
                </span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-1.5 sm:px-1">
            <label className="sr-only" htmlFor={`placar-casa-${id}`}>
              Gols {mandante.nome}
            </label>
            <input
              id={`placar-casa-${id}`}
              type="text"
              inputMode="numeric"
              disabled={encerrado}
              value={placarCasa}
              onChange={(e) => onPlacarChange(id, "casa", e.target.value)}
              className="h-10 w-11 rounded border border-zinc-700 bg-black text-center font-mono text-lg font-bold text-yellow-400 outline-none ring-0 placeholder:text-zinc-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/40 disabled:opacity-40 sm:h-11 sm:w-12 sm:text-xl"
              placeholder="—"
              maxLength={2}
              autoComplete="off"
            />
            <span className="select-none px-0.5 font-mono text-sm font-bold text-zinc-600 sm:text-base">
              ×
            </span>
            <label className="sr-only" htmlFor={`placar-fora-${id}`}>
              Gols {visitante.nome}
            </label>
            <input
              id={`placar-fora-${id}`}
              type="text"
              inputMode="numeric"
              disabled={encerrado}
              value={placarVisitante}
              onChange={(e) => onPlacarChange(id, "fora", e.target.value)}
              className="h-10 w-11 rounded border border-zinc-700 bg-black text-center font-mono text-lg font-bold text-yellow-400 outline-none placeholder:text-zinc-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/40 disabled:opacity-40 sm:h-11 sm:w-12 sm:text-xl"
              placeholder="—"
              maxLength={2}
              autoComplete="off"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-[38%]">
            <div className="min-w-0 text-right">
              <p className="truncate text-[12px] font-bold leading-tight text-zinc-100 sm:text-[13px]">
                {visitante.nome}
              </p>
              <p className="text-[9px] text-zinc-500">
                Ranking FIFA{" "}
                <span className="font-mono font-semibold text-yellow-500/90">
                  #{visitante.rankingFifa}
                </span>
              </p>
            </div>
            <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
              {visitante.bandeira}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-dashed border-zinc-800/80 pt-2">
          {salvoFlash ? (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-400">
              Palpite salvo
            </span>
          ) : (
            <span className="text-[9px] text-zinc-700"> </span>
          )}
          <button
            type="button"
            disabled={encerrado}
            onClick={() => onSalvarPalpite(id)}
            className="rounded bg-yellow-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-black transition-opacity hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Salvar Palpite
          </button>
        </div>
      </div>
    </div>
  );
}
