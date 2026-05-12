"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { salvarPalpitesBolao, verificarECarregarPalpitesBolao } from "@/app/bolao/palpites/actions";
import { Copa2026PalpiteCard } from "@/components/bolao/Copa2026PalpiteCard";
import { Copa2026PalpitesSidebar } from "@/components/bolao/Copa2026PalpitesSidebar";
import {
  COPA2026_JOGOS,
  COPA2026_PALPITES_STORAGE_KEY,
  type Copa2026PalpitesPersistidos,
  copa2026JogosPorGrupo,
} from "@/lib/mocks/copa2026-groupstage.mock";
import { isSupabaseMock } from "@/lib/supabase/is-mock";

const MSG_CONFIRMADOS = "Palpites confirmados com sucesso";
const MSG_SALVOS_SUPABASE = "Palpites salvos com sucesso.";

const SESSION_EMAIL_KEY = "barbosatips:bolao:palpites:email";

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

function normalizarEmailInput(email: string): string {
  return email.trim().toLowerCase();
}

export default function BolaoPalpitesPage() {
  const usarSupabase = useMemo(() => !isSupabaseMock(), []);

  const [placares, setPlacares] = useState<Record<string, { casa: string; fora: string }>>(
    () => placaresIniciais(),
  );
  const placaresRef = useRef(placares);
  useEffect(() => {
    placaresRef.current = placares;
  }, [placares]);

  const [confirmado, setConfirmado] = useState(false);
  const [hydrated, setHydrated] = useState(() => usarSupabase);
  const [msgConfirmados, setMsgConfirmados] = useState(false);
  const [sucessoSalvos, setSucessoSalvos] = useState(false);
  const [salvoFlash, setSalvoFlash] = useState<Record<string, boolean>>({});
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [emailInput, setEmailInput] = useState("");
  const [emailBolao, setEmailBolao] = useState("");
  const [emailOk, setEmailOk] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [erroEmail, setErroEmail] = useState("");
  const [erro, setErro] = useState("");

  const [salvandoJogoId, setSalvandoJogoId] = useState<string | null>(null);
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);

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
    if (!usarSupabase) return;
    try {
      const salvo = sessionStorage.getItem(SESSION_EMAIL_KEY);
      if (salvo) setEmailInput(salvo);
    } catch {
      /* ignore */
    }
  }, [usarSupabase]);

  useEffect(() => {
    if (usarSupabase) {
      setHydrated(true);
      return;
    }
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
      placaresRef.current = base;
      setConfirmado(Boolean(parsed.confirmado));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [usarSupabase]);

  const persistirLocal = useCallback(
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
      setPlacares((prev) => {
        const next = {
          ...prev,
          [jogoId]: {
            casa: campo === "casa" ? limpo : prev[jogoId]?.casa ?? "",
            fora: campo === "fora" ? limpo : prev[jogoId]?.fora ?? "",
          },
        };
        placaresRef.current = next;
        return next;
      });
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

  const dispararSucessoSalvos = useCallback(() => {
    setSucessoSalvos(true);
    window.setTimeout(() => setSucessoSalvos(false), 5000);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, []);

  async function handleVerificarEmail() {
    if (!usarSupabase) return;
    setErroEmail("");
    setErro("");
    const norm = normalizarEmailInput(emailInput);
    if (!norm || !norm.includes("@")) {
      setErroEmail("Informe o e-mail cadastrado no bolão.");
      return;
    }
    setVerificandoEmail(true);
    try {
      const res = await verificarECarregarPalpitesBolao(norm);
      if (!res.ok) {
        const error = new Error(res.error);
        console.error(error);
        setErro(error.message);
        setEmailOk(false);
        return;
      }
      try {
        sessionStorage.setItem(SESSION_EMAIL_KEY, norm);
      } catch {
        /* ignore */
      }
      setEmailBolao(norm);
      setEmailOk(true);
      setPlacares(res.placares);
      placaresRef.current = res.placares;
      setConfirmado(res.confirmado);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      setErro(error.message);
      setEmailOk(false);
    } finally {
      setVerificandoEmail(false);
    }
  }

  function handleTrocarEmail() {
    setEmailOk(false);
    setEmailBolao("");
    setErroEmail("");
    setErro("");
    const fresh = placaresIniciais();
    setPlacares(fresh);
    placaresRef.current = fresh;
    setConfirmado(false);
    try {
      sessionStorage.removeItem(SESSION_EMAIL_KEY);
    } catch {
      /* ignore */
    }
  }

  const onSalvarPalpite = useCallback(
    async (jogoId: string) => {
      if (confirmado) return;
      if (usarSupabase) {
        if (!emailBolao) return;
        setErro("");
        setSucessoSalvos(false);
        setSalvandoJogoId(jogoId);
        try {
          const res = await salvarPalpitesBolao(emailBolao, placaresRef.current, {
            confirmar: false,
            apenasJogoId: jogoId,
          });
          if (!res.ok) {
            const error = new Error(res.error);
            console.error(error);
            setErro(error.message);
            return;
          }
          dispararSucessoSalvos();
          dispararFlashSalvo(jogoId);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          console.error(error);
          setErro(error.message);
        } finally {
          setSalvandoJogoId(null);
        }
        return;
      }
      setPlacares((prev) => {
        persistirLocal(prev, confirmado);
        return prev;
      });
      dispararFlashSalvo(jogoId);
    },
    [
      confirmado,
      dispararFlashSalvo,
      dispararSucessoSalvos,
      emailBolao,
      persistirLocal,
      usarSupabase,
    ],
  );

  const confirmarTodos = useCallback(async () => {
    if (confirmado) {
      setMsgConfirmados(true);
      window.setTimeout(() => setMsgConfirmados(false), 4000);
      return;
    }
    if (usarSupabase) {
      if (!emailBolao) return;
      setErro("");
      setSucessoSalvos(false);
      setConfirmandoTodos(true);
      try {
        const res = await salvarPalpitesBolao(emailBolao, placaresRef.current, {
          confirmar: true,
        });
        if (!res.ok) {
          const error = new Error(res.error);
          console.error(error);
          setErro(error.message);
          return;
        }
        setConfirmado(true);
        dispararSucessoSalvos();
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(error);
        setErro(error.message);
      } finally {
        setConfirmandoTodos(false);
      }
      return;
    }
    setPlacares((prev) => {
      persistirLocal(prev, true);
      return prev;
    });
    setConfirmado(true);
    setMsgConfirmados(true);
    window.setTimeout(() => setMsgConfirmados(false), 5000);
  }, [confirmado, emailBolao, dispararSucessoSalvos, persistirLocal, usarSupabase]);

  const podeVerJogos = !usarSupabase || emailOk;
  const bloquearCards = confirmado;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black pb-10 pt-2 text-zinc-200">
      <div className="mx-auto max-w-5xl px-2 sm:px-3 lg:max-w-[1280px] lg:px-8 xl:max-w-[1360px] xl:px-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,300px)] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
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

            {usarSupabase && !emailOk ? (
              <div className="mb-4 rounded border border-zinc-800 bg-[#111] p-3 sm:p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-yellow-500/90">
                  Acesso aos palpites
                </p>
                <p className="mb-3 text-[11px] leading-relaxed text-zinc-400">
                  Digite o mesmo e-mail usado na inscrição do bolão. Só assim é possível salvar e
                  confirmar os placares no servidor.
                </p>
                <label htmlFor="bolao-email-palpites" className="sr-only">
                  E-mail da inscrição
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    id="bolao-email-palpites"
                    type="email"
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={verificandoEmail}
                    placeholder="seu@email.com"
                    className="min-h-[40px] flex-1 rounded border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-yellow-600/60 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={verificandoEmail}
                    onClick={() => void handleVerificarEmail()}
                    className="shrink-0 rounded bg-yellow-500 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-black transition hover:bg-yellow-400 disabled:opacity-40"
                  >
                    {verificandoEmail ? "Verificando…" : "Continuar"}
                  </button>
                </div>
                {erroEmail ? (
                  <p className="mt-2 text-xs text-red-400" role="alert">
                    {erroEmail}
                  </p>
                ) : null}
              </div>
            ) : null}

            {usarSupabase && emailOk ? (
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
                <p>
                  <span className="font-semibold text-zinc-400">E-mail:</span>{" "}
                  <span className="font-mono text-zinc-300">{emailBolao}</span>
                </p>
                <button
                  type="button"
                  onClick={handleTrocarEmail}
                  className="rounded border border-zinc-700 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-zinc-400 hover:border-yellow-600/40 hover:text-yellow-500"
                >
                  Trocar e-mail
                </button>
              </div>
            ) : null}

            {erro ? (
              <p className="mb-2 rounded border border-red-500/35 bg-red-950/30 px-2 py-2 text-xs text-red-300">
                {erro}
              </p>
            ) : null}

            {confirmado && (
              <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-600">
                {usarSupabase
                  ? "Rodada confirmada no bolão."
                  : "Rodada confirmada neste dispositivo."}
              </p>
            )}

            <div
              role="status"
              aria-live="polite"
              className={`mb-3 overflow-hidden transition-all duration-300 ${
                usarSupabase && sucessoSalvos ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {usarSupabase && sucessoSalvos && (
                <div className="rounded border border-emerald-500/40 bg-emerald-950/35 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-emerald-400">
                    {MSG_SALVOS_SUPABASE}
                  </p>
                </div>
              )}
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`mb-3 overflow-hidden transition-all duration-300 ${
                !usarSupabase && msgConfirmados ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {!usarSupabase && msgConfirmados && (
                <div className="rounded border border-yellow-600/40 bg-yellow-500/10 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-yellow-400">
                    {MSG_CONFIRMADOS}
                  </p>
                </div>
              )}
            </div>

            {!hydrated ? (
              <p className="py-8 text-center text-[11px] text-zinc-600">Carregando…</p>
            ) : !podeVerJogos ? (
              <p className="py-6 text-center text-[11px] text-zinc-600">
                Confirme o e-mail acima para ver os jogos e lançar palpites.
              </p>
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
                          onSalvarPalpite={(id) => void onSalvarPalpite(id)}
                          salvoFlash={Boolean(salvoFlash[jogo.id])}
                          bloquearEdicao={bloquearCards}
                          salvandoPalpite={salvandoJogoId === jogo.id}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                <div className="mt-4 border-t-2 border-yellow-500/40 pt-3">
                  <button
                    type="button"
                    disabled={!hydrated || confirmandoTodos}
                    onClick={() => void confirmarTodos()}
                    className="w-full rounded bg-yellow-500 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
                  >
                    {confirmandoTodos ? "Confirmando…" : "Confirmar todos os palpites"}
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
