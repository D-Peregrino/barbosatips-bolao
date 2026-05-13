"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  salvarPalpitesBolao,
  verificarECarregarPalpitesBolao,
} from "@/app/bolao/palpites/actions";
import {
  Copa2026PalpiteCard,
  type PontuacaoPalpiteCard,
} from "@/components/bolao/Copa2026PalpiteCard";
import { Copa2026PalpitesSidebar } from "@/components/bolao/Copa2026PalpitesSidebar";
import {
  COPA2026_JOGOS,
  COPA2026_PALPITES_STORAGE_KEY,
  type Copa2026PalpitesPersistidos,
  copa2026JogosPorGrupo,
  copa2026PalpitesTextoTempoRestante,
  copa2026PontuacaoPalpite,
} from "@/lib/mocks/copa2026-groupstage.mock";
import { isSupabaseMock } from "@/lib/supabase/is-mock";

const MSG_CONFIRMADOS = "Palpites confirmados com sucesso";
const MSG_SALVOS_SUPABASE = "Palpites salvos com sucesso.";
const MSG_PLACAR_INCOMPLETO =
  "Informe o placar do mandante e do visitante antes de salvar.";

const BOLAO_PARTICIPANTE_LS = "barbosatips:bolao:participante";

const LS_LEGACY_KEYS = [
  "barbosatips:bolao:palpites:v1",
  "barbosatips:copa2026:palpites:v2",
  "barbosatips:bolao:palpites:email",
] as const;

type BolaoParticipanteLocal = {
  nome: string;
  email: string;
};

function sanitizarPlacar(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 2);
}

function placarFormularioCompleto(p: { casa: string; fora: string }): boolean {
  const c = sanitizarPlacar(String(p.casa ?? ""));
  const f = sanitizarPlacar(String(p.fora ?? ""));

  if (!c || !f) return false;

  const nc = parseInt(c, 10);
  const nf = parseInt(f, 10);

  return Number.isFinite(nc) && Number.isFinite(nf) && nc >= 0 && nf >= 0;
}

function placaresIniciais(): Record<string, { casa: string; fora: string }> {
  return Object.fromEntries(
    COPA2026_JOGOS.map((j) => [j.id, { casa: "", fora: "" }]),
  );
}

function mapPalpiteSalvoServidor(
  placares: Record<string, { casa: string; fora: string }>,
): Record<string, boolean> {
  const m: Record<string, boolean> = {};

  for (const j of COPA2026_JOGOS) {
    m[j.id] = placarFormularioCompleto(
      placares[j.id] ?? { casa: "", fora: "" },
    );
  }

  return m;
}

function placarParaPontuacao(p: { casa: string; fora: string }): {
  c: number | null;
  f: number | null;
} {
  const cs = sanitizarPlacar(String(p.casa ?? ""));
  const fs = sanitizarPlacar(String(p.fora ?? ""));

  if (!cs || !fs) return { c: null, f: null };

  const c = parseInt(cs, 10);
  const f = parseInt(fs, 10);

  if (!Number.isFinite(c) || !Number.isFinite(f)) {
    return { c: null, f: null };
  }

  return { c, f };
}

function montarPontuacaoCard(
  jogoId: string,
  placar: { casa: string; fora: string },
): PontuacaoPalpiteCard {
  const { c, f } = placarParaPontuacao(placar);
  const pts = copa2026PontuacaoPalpite(jogoId, c, f);

  if (pts === null) return { modo: "aguardando_resultado" };

  return { modo: "pontos", valor: pts };
}

function lerParticipanteLocal(): BolaoParticipanteLocal | null {
  try {
    const bruto = localStorage.getItem(BOLAO_PARTICIPANTE_LS);

    if (!bruto) return null;

    const p = JSON.parse(bruto) as { nome?: unknown; email?: unknown };
    const nome = String(p.nome ?? "").trim();
    const email = String(p.email ?? "").trim().toLowerCase();

    if (!nome || !email || !email.includes("@")) return null;

    return { nome, email };
  } catch {
    return null;
  }
}

export default function BolaoPalpitesPage() {
  const router = useRouter();
  const usarSupabase = useMemo(() => !isSupabaseMock(), []);

  const [authGate, setAuthGate] = useState<"checking" | "ok" | "redirect">(
    "checking",
  );

  const [participante, setParticipante] =
    useState<BolaoParticipanteLocal | null>(null);

  const [placares, setPlacares] = useState<
    Record<string, { casa: string; fora: string }>
  >(() => placaresIniciais());

  const placaresRef = useRef(placares);

  useEffect(() => {
    placaresRef.current = placares;
  }, [placares]);

  const [palpiteSalvoServidor, setPalpiteSalvoServidor] = useState<
    Record<string, boolean>
  >({});

  const [confirmado, setConfirmado] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [msgConfirmados, setMsgConfirmados] = useState(false);
  const [sucessoSalvos, setSucessoSalvos] = useState(false);
  const [salvoFlash, setSalvoFlash] = useState<Record<string, boolean>>({});

  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [erro, setErro] = useState("");

  const [salvandoJogoId, setSalvandoJogoId] = useState<string | null>(null);
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);

  const [relogio, setRelogio] = useState(() => Date.now());

  const grupos = useMemo(() => copa2026JogosPorGrupo(), []);

  useEffect(() => {
    const id = window.setInterval(() => setRelogio(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    for (const k of LS_LEGACY_KEYS) {
      try {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const p = lerParticipanteLocal();

    if (!p) {
      setAuthGate("redirect");
      router.replace("/bolao/login");
      return;
    }

    setParticipante(p);
    setAuthGate("ok");
  }, [router]);

  useEffect(() => {
    if (authGate !== "ok" || !participante) return;

    const emailBolao = participante.email;
    let cancelado = false;

    async function carregar() {
      setErro("");
      setHydrated(false);

      if (usarSupabase) {
        const res = await verificarECarregarPalpitesBolao(emailBolao);

        console.log("CARREGAR PALPITES:", res);

        if (cancelado) return;

        if (!res.ok) {
          const error = new Error(res.error);
          console.error("ERRO AO CARREGAR PALPITES:", error);
          setErro(error.message);
          setPlacares(placaresIniciais());
          placaresRef.current = placaresIniciais();
          setPalpiteSalvoServidor({});
          setConfirmado(false);
          setHydrated(true);
          return;
        }

        setPlacares(res.placares);
        placaresRef.current = res.placares;
        setPalpiteSalvoServidor(mapPalpiteSalvoServidor(res.placares));
        setConfirmado(res.confirmado);
        setHydrated(true);
        return;
      }

      try {
        const bruto = localStorage.getItem(COPA2026_PALPITES_STORAGE_KEY);

        if (!bruto) {
          const base = placaresIniciais();
          setPlacares(base);
          placaresRef.current = base;
          setPalpiteSalvoServidor(mapPalpiteSalvoServidor(base));
          setConfirmado(false);
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
        setPalpiteSalvoServidor(mapPalpiteSalvoServidor(base));
        setConfirmado(Boolean(parsed.confirmado));
      } catch {
        const base = placaresIniciais();
        setPlacares(base);
        placaresRef.current = base;
        setPalpiteSalvoServidor(mapPalpiteSalvoServidor(base));
        setConfirmado(false);
      }

      setHydrated(true);
    }

    void carregar();

    return () => {
      cancelado = true;
    };
  }, [authGate, participante, usarSupabase]);

  const persistirLocal = useCallback(
    (
      nextPlacares: Record<string, { casa: string; fora: string }>,
      nextConfirmado: boolean,
    ) => {
      const payload: Copa2026PalpitesPersistidos = {
        placares: nextPlacares,
        confirmado: nextConfirmado,
      };

      try {
        localStorage.setItem(
          COPA2026_PALPITES_STORAGE_KEY,
          JSON.stringify(payload),
        );
      } catch {}
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

  function handleSair() {
    try {
      localStorage.removeItem(BOLAO_PARTICIPANTE_LS);
    } catch {}

    router.replace("/bolao/login");
  }

  const onSalvarPalpite = useCallback(
    async (jogoId: string) => {
      console.log("CLICOU EM SALVAR PALPITE:", jogoId);
      console.log("USAR SUPABASE:", usarSupabase);
      console.log("PARTICIPANTE:", participante);
      console.log("PLACARES ATUAIS:", placaresRef.current);

      if (confirmado) {
        console.warn("BLOQUEADO: palpites já confirmados.");
        setErro("Palpites já confirmados.");
        return;
      }

      if (!participante) {
        console.error("BLOQUEADO: participante não encontrado.");
        setErro("Participante não encontrado. Faça login novamente.");
        alert("Participante não encontrado. Faça login novamente.");
        return;
      }

      const atual = placaresRef.current[jogoId] ?? { casa: "", fora: "" };

      const vazio =
        sanitizarPlacar(atual.casa).length === 0 &&
        sanitizarPlacar(atual.fora).length === 0;

      if (!vazio && !placarFormularioCompleto(atual)) {
        const err = new Error(MSG_PLACAR_INCOMPLETO);
        console.error(err);
        setErro(MSG_PLACAR_INCOMPLETO);
        alert(MSG_PLACAR_INCOMPLETO);
        return;
      }

      if (usarSupabase) {
        setErro("");
        setSucessoSalvos(false);
        setSalvandoJogoId(jogoId);

        try {
          console.log("CHAMANDO SERVER ACTION salvarPalpitesBolao...");

          const res = await salvarPalpitesBolao(
            participante.email,
            placaresRef.current,
            {
              confirmar: false,
              apenasJogoId: jogoId,
            },
          );

          console.log("RESPOSTA ACTION:", res);

          if (!res.ok) {
            const error = new Error(res.error);
            console.error("ERRO RETORNADO PELA ACTION:", error);
            setErro(error.message);
            alert("Erro ao salvar palpite: " + error.message);
            return;
          }

          if (vazio) {
            setPlacares((prev) => {
              const next = { ...prev, [jogoId]: { casa: "", fora: "" } };
              placaresRef.current = next;
              return next;
            });
          }

          setPalpiteSalvoServidor((prev) => ({
            ...prev,
            [jogoId]:
              !vazio &&
              placarFormularioCompleto(placaresRef.current[jogoId] ?? atual),
          }));

          dispararSucessoSalvos();
          dispararFlashSalvo(jogoId);

          alert("Palpite salvo com sucesso!");
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          console.error("ERRO GERAL AO SALVAR PALPITE:", error);
          setErro(error.message);
          alert("Erro geral ao salvar palpite: " + error.message);
        } finally {
          setSalvandoJogoId(null);
        }

        return;
      }

      setPlacares((prev) => {
        persistirLocal(prev, confirmado);
        return prev;
      });

      setPalpiteSalvoServidor((prev) => ({
        ...prev,
        [jogoId]:
          !vazio &&
          placarFormularioCompleto(placaresRef.current[jogoId] ?? atual),
      }));

      dispararFlashSalvo(jogoId);

      alert("Palpite salvo localmente.");
    },
    [
      confirmado,
      dispararFlashSalvo,
      dispararSucessoSalvos,
      participante,
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

    if (!participante) {
      setErro("Participante não encontrado.");
      return;
    }

    for (const j of COPA2026_JOGOS) {
      const p = placaresRef.current[j.id] ?? { casa: "", fora: "" };

      const tem =
        sanitizarPlacar(String(p.casa ?? "")).length > 0 ||
        sanitizarPlacar(String(p.fora ?? "")).length > 0;

      if (tem && !placarFormularioCompleto(p)) {
        const err = new Error(MSG_PLACAR_INCOMPLETO);
        console.error(err);
        setErro(MSG_PLACAR_INCOMPLETO);
        return;
      }
    }

    if (usarSupabase) {
      setErro("");
      setSucessoSalvos(false);
      setConfirmandoTodos(true);

      try {
        console.log("CONFIRMANDO TODOS OS PALPITES...");

        const res = await salvarPalpitesBolao(
          participante.email,
          placaresRef.current,
          {
            confirmar: true,
          },
        );

        console.log("RESPOSTA CONFIRMAR TODOS:", res);

        if (!res.ok) {
          const error = new Error(res.error);
          console.error(error);
          setErro(error.message);
          alert("Erro ao confirmar todos: " + error.message);
          return;
        }

        setConfirmado(true);
        setPalpiteSalvoServidor(mapPalpiteSalvoServidor(placaresRef.current));
        dispararSucessoSalvos();
        alert("Todos os palpites foram confirmados.");
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(error);
        setErro(error.message);
        alert("Erro geral ao confirmar todos: " + error.message);
      } finally {
        setConfirmandoTodos(false);
      }

      return;
    }

    setPlacares((prev) => {
      persistirLocal(prev, true);
      return prev;
    });

    setPalpiteSalvoServidor(mapPalpiteSalvoServidor(placaresRef.current));
    setConfirmado(true);
    setMsgConfirmados(true);
    window.setTimeout(() => setMsgConfirmados(false), 5000);
  }, [
    confirmado,
    participante,
    dispararSucessoSalvos,
    persistirLocal,
    usarSupabase,
  ]);

  const bloquearCards = confirmado;

  if (authGate === "checking" || authGate === "redirect") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-black pb-10 pt-2 text-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-zinc-500">
          Carregando…
        </div>
      </div>
    );
  }

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

            {participante ? (
              <div className="mb-4 rounded border border-zinc-800 bg-[#111] p-3 sm:p-4">
                <p className="text-sm font-bold text-yellow-400/95 sm:text-base">
                  Olá, {participante.nome}
                </p>

                <p className="mt-1 text-[11px] text-zinc-500">
                  <span className="font-semibold text-zinc-400">E-mail:</span>{" "}
                  <span className="font-mono text-zinc-300">
                    {participante.email}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleSair}
                  className="mt-3 rounded border border-zinc-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 hover:border-red-500/40 hover:text-red-300"
                >
                  Sair
                </button>
              </div>
            ) : null}

            {confirmado && (
              <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-600">
                {usarSupabase
                  ? "Rodada confirmada no bolão."
                  : "Rodada confirmada neste dispositivo."}
              </p>
            )}

            {erro ? (
              <p className="mb-2 rounded border border-red-500/35 bg-red-950/30 px-2 py-2 text-xs text-red-300">
                {erro}
              </p>
            ) : null}

            <div
              role="status"
              aria-live="polite"
              className={`mb-3 overflow-hidden transition-all duration-300 ${
                usarSupabase && sucessoSalvos
                  ? "max-h-16 opacity-100"
                  : "max-h-0 opacity-0"
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
                !usarSupabase && msgConfirmados
                  ? "max-h-16 opacity-100"
                  : "max-h-0 opacity-0"
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
              <p className="py-8 text-center text-[11px] text-zinc-600">
                Carregando palpites…
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
                      {jogos.map((jogo) => {
                        const aberto = true;

                        const placar = placares[jogo.id] ?? {
                          casa: "",
                          fora: "",
                        };

                        return (
                          <Copa2026PalpiteCard
                            key={jogo.id}
                            jogo={jogo}
                            placarCasa={placar.casa}
                            placarVisitante={placar.fora}
                            onPlacarChange={onPlacarChange}
                            onSalvarPalpite={(jogo) => void onSalvarPalpite(jogo.id)}
                            salvoFlash={Boolean(salvoFlash[jogo.id])}
                            bloquearEdicao={bloquearCards}
                            salvandoPalpite={salvandoJogoId === jogo.id}
                            prazoPalpites={{
                              encerrado: false,
                              tempoRestante: aberto
                                ? copa2026PalpitesTextoTempoRestante(
                                    jogo.id,
                                    relogio,
                                  )
                                : null,
                            }}
                            palpiteSalvoNoServidor={Boolean(
                              palpiteSalvoServidor[jogo.id],
                            )}
                            pontuacaoBolao={montarPontuacaoCard(
                              jogo.id,
                              placar,
                            )}
                          />
                        );
                      })}
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
                    {confirmandoTodos
                      ? "Confirmando…"
                      : "Confirmar todos os palpites"}
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