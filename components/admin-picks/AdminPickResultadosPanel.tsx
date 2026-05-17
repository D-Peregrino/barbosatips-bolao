"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  marcarResultadoQuickPickAction,
  reabrirQuickPickAction,
  type SalvarQuickPickResult,
} from "@/app/admin-picks/actions";
import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import {
  pickComResultadoDefinitivo,
  pickPendenteResultado,
  type QuickPickRow,
} from "@/lib/picks/types";
import { cn } from "@/lib/utils";

type FiltroLista = "pendentes" | "finalizadas" | "todas";

function formatarHorario(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeResultado(p: QuickPickRow) {
  if (p.resultado === "green")
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-200";
  if (p.resultado === "red")
    return "border-red-500/40 bg-red-500/15 text-red-200";
  if (p.resultado === "void")
    return "border-slate-500/40 bg-slate-700/30 text-slate-200";
  if (p.status === "ativo")
    return "border-amber-500/35 bg-amber-500/10 text-amber-200";
  return "border-zinc-600 bg-zinc-800/50 text-zinc-400";
}

function labelResultado(p: QuickPickRow): string {
  if (p.resultado === "green") return "GREEN";
  if (p.resultado === "red") return "RED";
  if (p.resultado === "void") return "VOID";
  if (p.status === "ativo") return "AO VIVO";
  return "PENDENTE";
}

type PickCardProps = {
  pick: QuickPickRow;
};

function PickResultadoCard({ pick }: PickCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [placar, setPlacar] = useState(pick.placar_final ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendente = pickPendenteResultado(pick);

  function runAction(
    action: typeof marcarResultadoQuickPickAction | typeof reabrirQuickPickAction,
    extra?: (fd: FormData) => void,
  ) {
    setFeedback(null);
    setError(null);
    const fd = new FormData();
    fd.set("pick_id", pick.id);
    extra?.(fd);
    startTransition(async () => {
      const res = await action(undefined, fd);
      if (res.ok) {
        setFeedback(res.message ?? "OK");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function marcar(resultado: "green" | "red" | "void") {
    runAction(marcarResultadoQuickPickAction, (fd) => {
      fd.set("resultado", resultado);
      if (placar.trim()) fd.set("placar_final", placar.trim());
    });
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-zinc-950/60 p-4 shadow-lg transition",
        pendente ? "border-amber-500/20" : "border-zinc-800",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            {rotuloEsporte(pick.esporte)}
            {pick.campeonato?.trim() ? ` · ${pick.campeonato}` : ""}
          </p>
          <h3 className="mt-1 font-display text-base font-bold leading-snug text-white">
            {pick.jogo}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-400">{pick.mercado}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide",
            badgeResultado(pick),
          )}
        >
          {labelResultado(pick)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="font-mono text-amber-300/90">@{pick.odd.toFixed(2)}</span>
        <span>{pick.confianca}% conf.</span>
        <span>Jogo: {formatarHorario(pick.horario_jogo)}</span>
        {pick.resolved_at ? (
          <span>Fechada: {formatarHorario(pick.resolved_at)}</span>
        ) : null}
      </div>

      {pick.placar_final && !pendente ? (
        <p className="mt-2 text-xs text-zinc-500">
          Placar: <strong className="text-zinc-300">{pick.placar_final}</strong>
        </p>
      ) : null}

      {pendente ? (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                Placar final (opc.)
              </span>
              <input
                type="text"
                value={placar}
                onChange={(e) => setPlacar(e.target.value)}
                placeholder="ex.: 2-1"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
                disabled={pending}
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => marcar("green")}
              className="min-h-[44px] rounded-xl border border-emerald-500/45 bg-emerald-600/20 py-2.5 text-sm font-black uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-600/35 disabled:opacity-50"
            >
              Green
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => marcar("red")}
              className="min-h-[44px] rounded-xl border border-red-500/45 bg-red-600/20 py-2.5 text-sm font-black uppercase tracking-wide text-red-100 transition hover:bg-red-600/35 disabled:opacity-50"
            >
              Red
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => marcar("void")}
              className="min-h-[44px] rounded-xl border border-zinc-500/45 bg-zinc-700/30 py-2.5 text-sm font-black uppercase tracking-wide text-zinc-200 transition hover:bg-zinc-600/40 disabled:opacity-50"
            >
              Void
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => runAction(reabrirQuickPickAction)}
            className="min-h-[40px] rounded-lg border border-zinc-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            Reabrir
          </button>
          {pickComResultadoDefinitivo(pick) ? (
            <span className="text-[10px] text-zinc-600">
              Performance actualizada ao fechar
            </span>
          ) : null}
        </div>
      )}

      {pending ? (
        <p className="mt-2 text-xs text-amber-400/90">A gravar…</p>
      ) : null}
      {feedback ? (
        <p className="mt-2 text-xs text-emerald-400">{feedback}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </article>
  );
}

type Props = {
  picks: QuickPickRow[];
};

export function AdminPickResultadosPanel({ picks }: Props) {
  const [filtro, setFiltro] = useState<FiltroLista>("pendentes");
  const [esporte, setEsporte] = useState("");
  const [mercado, setMercado] = useState("");

  const esportes = useMemo(() => {
    const set = new Set(picks.map((p) => p.esporte).filter(Boolean));
    return Array.from(set).sort();
  }, [picks]);

  const mercados = useMemo(() => {
    const base =
      esporte.trim() === ""
        ? picks
        : picks.filter((p) => p.esporte === esporte);
    const set = new Set(base.map((p) => p.mercado).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [picks, esporte]);

  const filtradas = useMemo(() => {
    return picks.filter((p) => {
      if (filtro === "pendentes" && !pickPendenteResultado(p)) return false;
      if (filtro === "finalizadas" && !pickComResultadoDefinitivo(p)) return false;
      if (esporte && p.esporte !== esporte) return false;
      if (mercado && p.mercado !== mercado) return false;
      return true;
    });
  }, [picks, filtro, esporte, mercado]);

  const pendentesCount = picks.filter(pickPendenteResultado).length;
  const finalizadasCount = picks.filter(pickComResultadoDefinitivo).length;

  return (
    <section className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/20 to-zinc-950/80 p-4 shadow-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
            Resultados das picks
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Fecho operacional · {pendentesCount} pendente{pendentesCount !== 1 ? "s" : ""} ·{" "}
            {finalizadasCount} finalizada{finalizadasCount !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/performance"
          className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400/90 hover:text-emerald-300"
        >
          Ver performance →
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pendentes", `Pendentes (${pendentesCount})`],
            ["finalizadas", `Finalizadas (${finalizadasCount})`],
            ["todas", "Todas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFiltro(id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide transition",
              filtro === id
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-100"
                : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">
            Esporte
          </span>
          <select
            value={esporte}
            onChange={(e) => {
              setEsporte(e.target.value);
              setMercado("");
            }}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2.5 text-sm text-white"
          >
            <option value="">Todos</option>
            {esportes.map((s) => (
              <option key={s} value={s}>
                {rotuloEsporte(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">
            Mercado
          </span>
          <select
            value={mercado}
            onChange={(e) => setMercado(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2.5 text-sm text-white"
          >
            <option value="">Todos</option>
            {mercados.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-5 space-y-3">
        {filtradas.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-500">
            Nenhuma pick neste filtro.
          </li>
        ) : (
          filtradas.map((p) => (
            <li key={p.id}>
              <PickResultadoCard pick={p} />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
