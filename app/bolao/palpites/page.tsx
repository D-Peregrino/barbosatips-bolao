"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copa2026PalpiteCard } from "@/components/bolao/Copa2026PalpiteCard";
import { Copa2026PalpitesSidebar } from "@/components/bolao/Copa2026PalpitesSidebar";
import {
  COPA2026_JOGOS,
  COPA2026_PALPITES_STORAGE_KEY,
  type Copa2026PalpitesPersistidos,
  copa2026JogosPorGrupo,
} from "@/lib/mocks/copa2026-groupstage.mock";

const MSG_CONFIRMADOS = "Palpites confirmados com sucesso";

/** Chaves legadas de mocks de clubes/ligas — removidas para não poluir o cliente. */
const LS_LEGACY_KEYS = [
  "barbosatips:bolao:palpites:v1",
  "barbosatips:copa2026:palpites:v2",
] as const;

function sanitizarPlacar(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 2);
}

function placaresIniciais(): Record<string, { casa: string; fora: string }> {
  return Object.fromEntries(
    COPA2026_JOGOS.map((j) => [j.id, { casa: "", fora: "" }]),
  );
}

export default function BolaoPalpitesPage() {
  const [placares, setPlacares] = useState<Record<string, { casa: string; fora: string }>>(
    () => placaresIniciais(),
  );
  const [confirmado, setConfirmado] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [msgConfirmados, setMsgConfirmados] = useState(false);
  const [salvoFlash, setSalvoFlash] = useState<Record<string, boolean>>({});
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const grupos = useMemo(() => copa2026JogosPorGrupo(), []);

  useEffect(() => {
    for (const k of LS_LEGACY_KEYS) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(COPA2026_PALPITES_STORAGE_KEY);
      if (!bruto) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(bruto) as Copa2026PalpitesPersistidos;
      const base = placaresIniciais();
      if (parsed.placares && typeof parsed.placares === "object") {
        for (const j of COPA2026_JOGOS) {
          const p = parsed.placares[j.id];
          if (p && typeof p === "object") {
            base[j.id] = {
              casa: sanitizarPlacar(String(p.casa ?? "")),
              fora: sanitizarPlacar(String(p.fora ?? "")),
            };
          }
        }
      }
      setPlacares(base);
      setConfirmado(Boolean(parsed.confirmado));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persistir = useCallback(
    (nextPlacares: Record<string, { casa: string; fora: string }>, nextConfirmado: boolean) => {
      const payload: Copa2026PalpitesPersistidos = {
        placares: nextPlacares,
        confirmado: nextConfirmado,
      };
      try {
        localStorage.setItem(COPA2026_PALPITES_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const onPlacarChange = useCallback(
    (jogoId: string, campo: "casa" | "fora", valor: string) => {
      if (confirmado) return;
      const limpo = sanitizarPlacar(valor);
      setPlacares((prev) => ({
        ...prev,
        [jogoId]: {
          casa: campo === "casa" ? limpo : prev[jogoId]?.casa ?? "",
          fora: campo === "fora" ? limpo : prev[jogoId]?.fora ?? "",
        },
      }));
    },
    [confirmado],
  );

  const dispararFlashSalvo = useCallback((jogoId: string) => {
    const prev = flashTimers.current[jogoId];
    if (prev) clearTimeout(prev);
    setSalvoFlash((s) => ({ ...s, [jogoId]: true }));
    flashTimers.current[jogoId] = setTimeout(() => {
      setSalvoFlash((s) => ({ ...s, [jogoId]: false }));
      delete flashTimers.current[jogoId];
    }, 1800);
  }, []);

  const onSalvarPalpite = useCallback(
    (jogoId: string) => {
      if (confirmado) return;
      setPlacares((prev) => {
        persistir(prev, confirmado);
        return prev;
      });
      dispararFlashSalvo(jogoId);
    },
    [confirmado, dispararFlashSalvo, persistir],
  );

  useEffect(() => {
    return () => {
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, []);

  const confirmarTodos = useCallback(() => {
    if (confirmado) {
      setMsgConfirmados(true);
      window.setTimeout(() => setMsgConfirmados(false), 4000);
      return;
    }
    setPlacares((prev) => {
      persistir(prev, true);
      return prev;
    });
    setConfirmado(true);
    setMsgConfirmados(true);
    window.setTimeout(() => setMsgConfirmados(false), 5000);
  }, [confirmado, persistir]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black pb-10 pt-2 text-zinc-200">
      <div className="mx-auto max-w-5xl px-2 sm:px-3 lg:max-w-[1100px]">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-1 flex items-start justify-between gap-2">
              <header className="min-w-0 border-b-2 border-yellow-500 pb-2 pr-2">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-yellow-500">
                  BarbosaTips
                </p>
                <h1 className="font-display text-base font-black uppercase leading-tight tracking-tight text-yellow-400 sm:text-lg">
                  Bolão Copa do Mundo 2026
                </h1>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Fase de grupos · Palpites
                </p>
              </header>
              <Link
                href="/bolao"
                className="shrink-0 rounded border border-zinc-800 bg-[#111] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-zinc-400 hover:border-yellow-600/50 hover:text-yellow-500"
              >
                Voltar
              </Link>
            </div>

            {confirmado && (
              <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-600">
                Rodada confirmada neste dispositivo.
              </p>
            )}

            <div
              role="status"
              aria-live="polite"
              className={`mb-3 overflow-hidden transition-all duration-300 ${
                msgConfirmados ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {msgConfirmados && (
                <div className="rounded border border-yellow-600/40 bg-yellow-500/10 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-yellow-400">
                    {MSG_CONFIRMADOS}
                  </p>
                </div>
              )}
            </div>

            {!hydrated ? (
              <p className="py-8 text-center text-[11px] text-zinc-600">Carregando…</p>
            ) : (
              <>
                {grupos.map(({ grupo, jogos }) => (
                  <section key={grupo} className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-[3px] min-w-[12px] flex-1 bg-yellow-500" />
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                        Grupo {grupo}
                      </span>
                      <div className="h-[3px] min-w-[12px] flex-1 bg-yellow-500" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {jogos.map((jogo) => (
                        <Copa2026PalpiteCard
                          key={jogo.id}
                          jogo={jogo}
                          placarCasa={placares[jogo.id]?.casa ?? ""}
                          placarVisitante={placares[jogo.id]?.fora ?? ""}
                          onPlacarChange={onPlacarChange}
                          onSalvarPalpite={onSalvarPalpite}
                          salvoFlash={Boolean(salvoFlash[jogo.id])}
                          bloquearEdicao={confirmado}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                <div className="mt-4 border-t-2 border-yellow-500/40 pt-3">
                  <button
                    type="button"
                    disabled={!hydrated}
                    onClick={confirmarTodos}
                    className="w-full rounded bg-yellow-500 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
                  >
                    Confirmar todos os palpites
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 lg:sticky lg:top-20 lg:mt-0">
            <Copa2026PalpitesSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
