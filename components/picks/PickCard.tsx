import type { QuickPickRow } from "@/lib/picks/types";
import { cn } from "@/lib/utils";
import { iconeEsporte, rotuloEsporte } from "@/lib/picks/rotulo-esporte";

function formatarHorario(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function corConfianca(n: number): string {
  if (n >= 80) return "from-amber-500/90 to-orange-600 text-pitch-950";
  if (n >= 60) return "from-emerald-500/85 to-emerald-700 text-white";
  return "from-zinc-500 to-zinc-700 text-white";
}

export function PickCard({ pick }: { pick: QuickPickRow }) {
  const sportLabel = rotuloEsporte(pick.esporte);
  const icon = iconeEsporte(pick.esporte);

  const resultado = pick.resultado;
  const encerrada = pick.status === "encerrado";
  const comResultado = encerrada && (resultado === "green" || resultado === "red");

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,.75)] transition duration-300 hover:-translate-y-0.5",
        comResultado && resultado === "green" && "border-emerald-500/45 bg-gradient-to-br from-emerald-950/50 to-pitch-950 ring-1 ring-emerald-500/20",
        comResultado && resultado === "red" && "border-red-500/45 bg-gradient-to-br from-red-950/45 to-pitch-950 ring-1 ring-red-500/20",
        encerrada && !comResultado && "border-zinc-600/50 bg-zinc-950/80",
        !encerrada && "border-[#3d3420]/80 bg-gradient-to-br from-[#12100e] to-[#080706]",
      )}
    >
      {comResultado ? (
        <div
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg font-black shadow-lg",
            resultado === "green" && "bg-emerald-500 text-pitch-950",
            resultado === "red" && "bg-red-500 text-white",
          )}
          aria-label={resultado === "green" ? "Pick green" : "Pick red"}
        >
          {resultado === "green" ? "✓" : "✕"}
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2 pr-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
          <span aria-hidden>{icon}</span>
          {sportLabel}
        </span>
        {pick.campeonato?.trim() ? (
          <span className="rounded-full border border-gold/25 bg-gold/5 px-2.5 py-0.5 text-[11px] font-medium text-gold/90">
            {pick.campeonato.trim()}
          </span>
        ) : null}
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            pick.status === "ativo"
              ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border border-zinc-600/50 bg-zinc-800/50 text-zinc-400",
          )}
        >
          {pick.status === "ativo" ? "Ativa" : "Encerrada"}
        </span>
      </div>

      <h2 className="font-display text-xl font-bold leading-snug text-white sm:text-2xl">
        {pick.jogo}
      </h2>

      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium text-zinc-400">Mercado</span>
        <span className="rounded-lg bg-white/5 px-2 py-0.5 text-sm font-semibold text-zinc-100">
          {pick.mercado}
        </span>
        <span className="ml-auto font-mono text-lg font-bold tabular-nums text-gold">
          @{pick.odd.toFixed(2).replace(".", ",")}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
        {pick.justificativa?.trim() || "Pick rápida — sem justificativa longa."}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div className="text-xs text-zinc-500">
          <span className="block uppercase tracking-wider text-zinc-600">Jogo</span>
          <time dateTime={pick.horario_jogo} className="font-medium text-zinc-300">
            {formatarHorario(pick.horario_jogo)}
          </time>
        </div>
        <div
          className={cn(
            "rounded-lg bg-gradient-to-r px-3 py-1.5 text-xs font-black uppercase tracking-wide shadow-md",
            corConfianca(pick.confianca),
          )}
        >
          Confiança {pick.confianca}%
        </div>
      </div>
    </article>
  );
}
