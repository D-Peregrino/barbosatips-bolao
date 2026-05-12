"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PalpiteJogoCard } from "@/components/bolao/PalpiteJogoCard";
import {
  BOLAO_JOGOS_PALPITES_MOCK,
  BOLAO_PALPITES_STORAGE_KEY,
  type PalpitesSalvosMap,
} from "@/lib/mocks/bolao-palpites.mock";

const MSG_SUCESSO = "Palpites salvos com sucesso";

function sanitizarPlacar(valor: string): string {
  const soDigitos = valor.replace(/\D/g, "");
  return soDigitos.slice(0, 2);
}

function mapaInicialVazio(): PalpitesSalvosMap {
  return Object.fromEntries(
    BOLAO_JOGOS_PALPITES_MOCK.map((j) => [j.id, { casa: "", fora: "" }]),
  );
}

export default function BolaoPalpitesPage() {
  const [placares, setPlacares] = useState<PalpitesSalvosMap>(() =>
    mapaInicialVazio(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState(false);

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(BOLAO_PALPITES_STORAGE_KEY);
      if (!bruto) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(bruto) as unknown;
      if (!parsed || typeof parsed !== "object") {
        setHydrated(true);
        return;
      }
      const base = mapaInicialVazio();
      for (const j of BOLAO_JOGOS_PALPITES_MOCK) {
        const p = (parsed as PalpitesSalvosMap)[j.id];
        if (p && typeof p === "object") {
          base[j.id] = {
            casa: sanitizarPlacar(String(p.casa ?? "")),
            fora: sanitizarPlacar(String(p.fora ?? "")),
          };
        }
      }
      setPlacares(base);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const onPlacarChange = useCallback(
    (jogoId: string, campo: "casa" | "fora", valor: string) => {
      const limpo = sanitizarPlacar(valor);
      setPlacares((prev) => ({
        ...prev,
        [jogoId]: {
          casa: campo === "casa" ? limpo : prev[jogoId]?.casa ?? "",
          fora: campo === "fora" ? limpo : prev[jogoId]?.fora ?? "",
        },
      }));
    },
    [],
  );

  const salvar = useCallback(() => {
    try {
      localStorage.setItem(BOLAO_PALPITES_STORAGE_KEY, JSON.stringify(placares));
      setMsgSucesso(true);
      window.setTimeout(() => setMsgSucesso(false), 4500);
    } catch {
      /* quota ou privado */
    }
  }, [placares]);

  const lista = useMemo(() => BOLAO_JOGOS_PALPITES_MOCK, []);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-pitch-950 pb-16 pt-6 sm:pt-10">
      <div className="container-site px-4">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col gap-4 border-b border-pitch-700 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/80">
              Bolão BarbosaTips
            </p>
            <h1 className="font-display text-2xl font-bold text-gold sm:text-3xl md:text-4xl">
              Palpites
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-400">
              Preencha o placar de cada jogo e salve. Seus palpites ficam neste
              aparelho até integrarmos ao servidor.
            </p>
          </div>
          <Link
            href="/bolao"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-pitch-600 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:border-gold/40 hover:text-gold"
          >
            ← Voltar ao bolão
          </Link>
        </div>

        {/* Sucesso */}
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 overflow-hidden rounded-lg border transition-all duration-300 ${
            msgSucesso
              ? "max-h-24 border-gold/35 bg-gold/10 py-3 opacity-100"
              : "max-h-0 border-transparent py-0 opacity-0"
          }`}
        >
          {msgSucesso && (
            <p className="px-4 text-center text-sm font-semibold text-gold">
              {MSG_SUCESSO}
            </p>
          )}
        </div>

        {/* Lista */}
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {!hydrated ? (
            <p className="text-center text-sm text-neutral-500">Carregando…</p>
          ) : (
            lista.map((jogo) => (
              <PalpiteJogoCard
                key={jogo.id}
                jogo={jogo}
                placarCasa={placares[jogo.id]?.casa ?? ""}
                placarVisitante={placares[jogo.id]?.fora ?? ""}
                onPlacarChange={onPlacarChange}
              />
            ))
          )}
        </div>

        {/* Ação */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={salvar}
            disabled={!hydrated}
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-8 text-sm font-bold text-pitch-950 shadow-lg transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar Palpites
          </button>
        </div>
      </div>
    </div>
  );
}
