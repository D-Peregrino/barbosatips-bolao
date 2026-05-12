"use client";

import type {
  JogoCopa2026Resolvido,
  StatusPalpiteJogo,
} from "@/lib/mocks/copa2026-groupstage.mock";

function badgeStatus(status: StatusPalpiteJogo) {
  const base =
    "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider lg:px-2 lg:py-1 lg:text-[10px]";
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

function badgePalpitesPrazo(encerrado: boolean) {
  const base =
    "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider lg:px-2 lg:py-1 lg:text-[10px]";
  if (encerrado) {
    return `${base} bg-zinc-700/40 text-zinc-400 ring-1 ring-zinc-600/50`;
  }
  return `${base} bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30`;
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
  /** Desabilita só o botão Salvar (ex.: gravação no Supabase em andamento). */
  salvandoPalpite?: boolean;
  /**
   * Prazo de palpites (15 min antes do jogo). Quando ausente, usa o status ilustrativo do mock.
   */
  prazoPalpites?: {
    encerrado: boolean;
    tempoRestante?: string | null;
  };
}

export function Copa2026PalpiteCard({
  jogo,
  placarCasa,
  placarVisitante,
  onPlacarChange,
  onSalvarPalpite,
  salvoFlash,
  bloquearEdicao,
  salvandoPalpite,
  prazoPalpites,
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

  const usaPrazoReal = Boolean(prazoPalpites);
  const palpitesFechadosPorPrazo = usaPrazoReal && prazoPalpites!.encerrado;
  const encerrado =
    Boolean(bloquearEdicao) ||
    palpitesFechadosPorPrazo ||
    (!usaPrazoReal && status === "encerrado");

  return (
    <div className="border border-[#1f1f1f] bg-[#101010] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:rounded-md">
      <div className="flex flex-col gap-1 border-b border-[#252525] bg-[#0a0a0a] px-2.5 py-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-1 lg:px-5 lg:py-2.5 lg:gap-x-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-500 lg:gap-x-3 lg:text-xs">
          <span className="font-black uppercase tracking-wide text-yellow-500/90">
            Grupo {grupo}
          </span>
          <span className="text-zinc-600" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-zinc-400 lg:text-sm">
            {formatarData(dataISO)} · {horario}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          {usaPrazoReal ? (
            <>
              <span className={badgePalpitesPrazo(prazoPalpites!.encerrado)}>
                {prazoPalpites!.encerrado ? "Palpites encerrados" : "Aberto"}
              </span>
              {!prazoPalpites!.encerrado && prazoPalpites!.tempoRestante ? (
                <span className="max-w-[220px] text-right text-[9px] font-semibold leading-tight text-yellow-600/90 lg:max-w-none lg:text-[10px]">
                  {prazoPalpites!.tempoRestante}
                </span>
              ) : null}
            </>
          ) : (
            <span className={badgeStatus(status)}>{labelStatus(status)}</span>
          )}
        </div>
      </div>

      <div className="border-b border-[#1a1a1a] px-2.5 py-1 text-[9px] leading-tight text-zinc-500 lg:px-5 lg:py-1.5 lg:text-[11px] lg:leading-snug">
        <span className="text-zinc-400">{estadio}</span>
        <span className="text-zinc-600" aria-hidden="true">
          {" "}
          ·{" "}
        </span>
        <span className="text-zinc-500">{cidade}</span>
      </div>

      <div className="px-2.5 py-2.5 lg:px-5 lg:py-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 lg:min-h-[5.5rem] lg:gap-6 xl:gap-10">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[38%] lg:max-w-none lg:basis-[32%] lg:gap-4 xl:gap-5">
            <span
              className="shrink-0 select-none text-xl leading-none lg:text-[2.1rem] lg:leading-none xl:text-[2.35rem]"
              aria-hidden="true"
            >
              {mandante.bandeira}
            </span>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 lg:gap-1.5">
              <p className="truncate text-[12px] font-bold leading-tight text-zinc-100 sm:text-[13px] lg:text-base lg:leading-snug xl:text-lg">
                {mandante.nome}
              </p>
              <p className="text-[9px] leading-snug text-zinc-500 lg:text-xs xl:text-sm">
                <span className="text-zinc-500">Ranking FIFA</span>{" "}
                <span className="font-mono font-bold tabular-nums text-yellow-400 lg:text-sm xl:text-base">
                  #{mandante.rankingFifa}
                </span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-1.5 sm:px-1 lg:gap-2.5 lg:px-2">
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
              className="h-10 w-11 rounded-md border-2 border-zinc-700 bg-black text-center font-mono text-lg font-bold text-yellow-400 outline-none ring-0 placeholder:text-zinc-700 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 disabled:opacity-40 lg:h-[3.25rem] lg:w-14 lg:text-2xl xl:h-14 xl:w-[3.75rem] xl:text-[1.75rem]"
              placeholder="—"
              maxLength={2}
              autoComplete="off"
            />
            <span className="select-none px-0.5 font-mono text-sm font-bold text-zinc-500 lg:px-1 lg:text-lg xl:text-xl">
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
              className="h-10 w-11 rounded-md border-2 border-zinc-700 bg-black text-center font-mono text-lg font-bold text-yellow-400 outline-none placeholder:text-zinc-700 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 disabled:opacity-40 lg:h-[3.25rem] lg:w-14 lg:text-2xl xl:h-14 xl:w-[3.75rem] xl:text-[1.75rem]"
              placeholder="—"
              maxLength={2}
              autoComplete="off"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-[38%] lg:max-w-none lg:basis-[32%] lg:gap-4 xl:gap-5">
            <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-0.5 text-right lg:gap-1.5">
              <p className="truncate text-[12px] font-bold leading-tight text-zinc-100 sm:text-[13px] lg:text-base lg:leading-snug xl:text-lg">
                {visitante.nome}
              </p>
              <p className="text-[9px] leading-snug text-zinc-500 lg:text-xs xl:text-sm">
                <span className="text-zinc-500">Ranking FIFA</span>{" "}
                <span className="font-mono font-bold tabular-nums text-yellow-400 lg:text-sm xl:text-base">
                  #{visitante.rankingFifa}
                </span>
              </p>
            </div>
            <span
              className="shrink-0 select-none text-xl leading-none lg:text-[2.1rem] lg:leading-none xl:text-[2.35rem]"
              aria-hidden="true"
            >
              {visitante.bandeira}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-dashed border-zinc-800/80 pt-2 lg:mt-4 lg:pt-3">
          {salvoFlash ? (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-400 lg:text-[11px]">
              Palpite salvo
            </span>
          ) : (
            <span className="text-[9px] text-zinc-700 lg:text-[11px]"> </span>
          )}
          <button
            type="button"
            disabled={encerrado || salvandoPalpite}
            onClick={() => onSalvarPalpite(id)}
            className="rounded-md bg-yellow-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-black shadow-sm transition-opacity hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 lg:px-5 lg:py-2 lg:text-xs xl:text-sm"
          >
            {salvandoPalpite ? "Salvando…" : "Salvar Palpite"}
          </button>
        </div>
      </div>
    </div>
  );
}
