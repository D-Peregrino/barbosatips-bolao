"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  salvarPalpitesBolao,
  verificarECarregarPalpitesBolao,
} from "@/app/bolao/palpites/actions";
import { MSG_PALPITES_ENCERRADOS_JOGO } from "@/app/bolao/palpites/utils";
import {
  Copa2026PalpiteCard,
  type PontuacaoPalpiteCard,
} from "@/components/bolao/Copa2026PalpiteCard";
import { BolaoSessaoRecoveryPanel } from "@/components/bolao/BolaoSessaoRecoveryPanel";
import { Copa2026PalpitesSidebar } from "@/components/bolao/Copa2026PalpitesSidebar";
import {
  COPA2026_DEV_PALPITE_BLOQUEIO_ID,
  COPA2026_JOGOS,
  type JogoCopa2026Resolvido,
  copa2026DevPalpiteBloqueioAtivo,
  copa2026JogosPorGrupo,
  copa2026PalpitesAbertosParaJogo,
  copa2026PalpitesTextoTempoRestante,
  copa2026PontuacaoPalpite,
} from "@/lib/mocks/copa2026-groupstage.mock";

const MSG_CONFIRMADOS = "Palpites confirmados com sucesso";
const MSG_SALVOS_SUPABASE = "Palpites salvos com sucesso.";
const MSG_PALPITE_SALVO_DB = "Palpite salvo no banco de dados.";
const MSG_PLACAR_INCOMPLETO =
  "Informe o placar do mandante e do visitante antes de salvar.";

const BOLAO_PARTICIPANTE_LS = "barbosatips:bolao:participante";

/** Só `true` após linha real em `palpites_bolao` (SELECT / refetch pós-salvar). */
type CelulaPalpite = {
  placar_casa: string;
  placar_fora: string;
  existeNoBanco: boolean;
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

function placarParaPontuacao(p: { casa: string; fora: string }): {
  c: number | null;
  f: number | null;
} {
  const cs = sanitizarPlacar(String(p.casa ?? ""));
  const fs = sanitizarPlacar(String(p.fora ?? ""));
  if (!cs || !fs) return { c: null, f: null };
  const c = parseInt(cs, 10);
  const f = parseInt(fs, 10);
  if (!Number.isFinite(c) || !Number.isFinite(f)) return { c: null, f: null };
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

function montarPalpitesAPartirDoServidor(res: {
  placares: Record<string, { casa: string; fora: string }>;
  palpitePersistidoPorJogo: Record<string, boolean>;
}): Record<string, CelulaPalpite> {
  const out: Record<string, CelulaPalpite> = {};
  for (const j of COPA2026_JOGOS) {
    if (!res.palpitePersistidoPorJogo[j.id]) continue;
    const p = res.placares[j.id] ?? { casa: "", fora: "" };
    out[j.id] = {
      placar_casa: sanitizarPlacar(String(p.casa ?? "")),
      placar_fora: sanitizarPlacar(String(p.fora ?? "")),
      existeNoBanco: true,
    };
  }
  return out;
}

function lerParticipanteLocal(): {
  inscricao_id: string;
  nome: string;
  email: string;
} | null {
  try {
    const bruto = localStorage.getItem(BOLAO_PARTICIPANTE_LS);
    if (!bruto) return null;
    const p = JSON.parse(bruto) as {
      inscricao_id?: unknown;
      nome?: unknown;
      email?: unknown;
    };
    const inscricao_id = String(p.inscricao_id ?? "").trim();
    const nome = String(p.nome ?? "").trim();
    const email = String(p.email ?? "").trim().toLowerCase();
    if (!inscricao_id || !nome || !email || !email.includes("@")) return null;
    return { inscricao_id, nome, email };
  } catch {
    return null;
  }
}

type SessaoBolao = "checking" | "sem_sessao" | "logado";

export default function BolaoPalpitesPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [sessaoBolao, setSessaoBolao] = useState<SessaoBolao>("checking");
  const sessaoBolaoRef = useRef<SessaoBolao>("checking");

  const [participante, setParticipante] = useState<{
    inscricao_id: string;
    nome: string;
    email: string;
  } | null>(null);

  const [palpites, setPalpites] = useState<Record<string, CelulaPalpite>>({});

  const [confirmado, setConfirmado] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [msgConfirmados, setMsgConfirmados] = useState(false);
  const [sucessoSalvos, setSucessoSalvos] = useState(false);
  const [palpiteSalvoDbMsg, setPalpiteSalvoDbMsg] = useState("");
  const [salvoFlash, setSalvoFlash] = useState<Record<string, boolean>>({});

  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [erro, setErro] = useState("");

  const [salvandoJogoId, setSalvandoJogoId] = useState<string | null>(null);
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);

  const [relogio, setRelogio] = useState(() => Date.now());

  const grupos = useMemo(() => copa2026JogosPorGrupo(), []);

  useEffect(() => {
    sessaoBolaoRef.current = sessaoBolao;
  }, [sessaoBolao]);

  useEffect(() => {
    const id = window.setInterval(() => setRelogio(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const p = lerParticipanteLocal();
    if (!p) {
      setParticipante(null);
      setSessaoBolao("sem_sessao");
      return;
    }
    setParticipante(p);
    setSessaoBolao("logado");
  }, []);

  useEffect(() => {
    if (sessaoBolao !== "sem_sessao") return;
    if (!pathname?.startsWith("/bolao/palpites")) return;
    router.replace("/bolao/login");
  }, [sessaoBolao, pathname, router]);

  useEffect(() => {
    function sincronizarParticipanteComArmazenamento() {
      const p = lerParticipanteLocal();
      const atual = sessaoBolaoRef.current;
      if (!p) {
        if (atual === "logado") {
          setParticipante(null);
          setSessaoBolao("sem_sessao");
          if (pathname?.startsWith("/bolao/palpites")) {
            router.replace("/bolao/login");
          }
        }
        return;
      }
      if (atual === "sem_sessao") {
        setParticipante(p);
        setSessaoBolao("logado");
      }
    }
    window.addEventListener("focus", sincronizarParticipanteComArmazenamento);
    window.addEventListener("storage", sincronizarParticipanteComArmazenamento);
    return () => {
      window.removeEventListener("focus", sincronizarParticipanteComArmazenamento);
      window.removeEventListener("storage", sincronizarParticipanteComArmazenamento);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (sessaoBolao !== "logado" || !participante) return;

    const emailBolao = participante.email;
    const inscricaoIdBolao = participante.inscricao_id;
    let cancelado = false;

    async function carregar() {
      setPalpites({});
      setConfirmado(false);
      setErro("");
      setHydrated(false);

      const res = await verificarECarregarPalpitesBolao(emailBolao, inscricaoIdBolao);
      if (cancelado) return;

      if (!res.ok) {
        setErro(res.error);
        setPalpites({});
        setHydrated(true);
        return;
      }

      setPalpites(montarPalpitesAPartirDoServidor(res));
      setConfirmado(res.confirmado);
      setHydrated(true);
    }

    void carregar();

    return () => {
      cancelado = true;
    };
  }, [sessaoBolao, participante]);

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

  const dispararPalpiteSalvoDbMsg = useCallback(() => {
    setPalpiteSalvoDbMsg(MSG_PALPITE_SALVO_DB);
    window.setTimeout(() => setPalpiteSalvoDbMsg(""), 5000);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, []);

  function handleSair() {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    setParticipante(null);
    setSessaoBolao("sem_sessao");
    setPalpites({});
    router.replace("/bolao/login");
  }

  const onPlacarChange = useCallback(
    (jogoId: string, campo: "casa" | "fora", valor: string) => {
      if (!copa2026PalpitesAbertosParaJogo(jogoId, relogio)) return;
      const limpo = sanitizarPlacar(valor);
      setPalpites((prev) => {
        const cur = prev[jogoId];
        return {
          ...prev,
          [jogoId]: {
            placar_casa: campo === "casa" ? limpo : cur?.placar_casa ?? "",
            placar_fora: campo === "fora" ? limpo : cur?.placar_fora ?? "",
            existeNoBanco: cur?.existeNoBanco ?? false,
          },
        };
      });
    },
    [relogio],
  );

  const aplicarRespostaServidor = useCallback(
    (res: {
      ok: true;
      placares: Record<string, { casa: string; fora: string }>;
      confirmado: boolean;
      palpitePersistidoPorJogo: Record<string, boolean>;
    }) => {
      setPalpites((prev) => {
        const base = montarPalpitesAPartirDoServidor(res);
        const out: Record<string, CelulaPalpite> = { ...base };
        for (const j of COPA2026_JOGOS) {
          const lac = prev[j.id];
          if (lac && !lac.existeNoBanco && !base[j.id]) {
            out[j.id] = { ...lac, existeNoBanco: false };
          }
        }
        return out;
      });
      setConfirmado(res.confirmado);
    },
    [],
  );

  const salvarPalpite = useCallback(
    async (jogo: JogoCopa2026Resolvido) => {
      const jogoId = String(jogo?.id ?? "");

      if (
        copa2026DevPalpiteBloqueioAtivo() &&
        jogoId === COPA2026_DEV_PALPITE_BLOQUEIO_ID
      ) {
        return;
      }

      if (confirmado) {
        setErro("Os palpites já foram confirmados e não podem mais ser alterados.");
        return;
      }

      if (!copa2026PalpitesAbertosParaJogo(jogoId, relogio)) {
        setErro(MSG_PALPITES_ENCERRADOS_JOGO);
        return;
      }

      if (!participante?.inscricao_id?.trim()) {
        setErro("Sessão inválida ou expirada. Faça login novamente.");
        return;
      }

      const atual = palpites[jogoId] ?? {
        placar_casa: "",
        placar_fora: "",
        existeNoBanco: false,
      };
      const sc = sanitizarPlacar(atual.placar_casa);
      const sf = sanitizarPlacar(atual.placar_fora);
      const vazio = sc.length === 0 && sf.length === 0;

      if (!vazio && !placarFormularioCompleto({ casa: sc, fora: sf })) {
        setErro(MSG_PLACAR_INCOMPLETO);
        return;
      }

      setSucessoSalvos(false);
      setPalpiteSalvoDbMsg("");
      setSalvandoJogoId(jogoId);

      try {
        const rawC = vazio ? null : Number.parseInt(sc, 10);
        const rawF = vazio ? null : Number.parseInt(sf, 10);
        const placar_casa =
          rawC !== null && Number.isFinite(rawC) ? rawC : null;
        const placar_fora =
          rawF !== null && Number.isFinite(rawF) ? rawF : null;

        const response = await fetch("/api/bolao/palpites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: participante.email,
            inscricao_id: participante.inscricao_id,
            jogo_id: jogoId,
            placar_casa,
            placar_fora,
          }),
        });

        let data: { ok?: boolean; error?: string } = {};
        try {
          data = (await response.json()) as { ok?: boolean; error?: string };
        } catch {
          data = {};
        }

        if (!response.ok || data.ok === false) {
          const msgErro =
            (typeof data.error === "string" && data.error.trim()) ||
            `Erro HTTP ${response.status}`;
          setErro(msgErro);
          return;
        }

        setErro("");
        dispararPalpiteSalvoDbMsg();

        if (!vazio) {
          setPalpites((prev) => ({
            ...prev,
            [jogoId]: {
              placar_casa: sc,
              placar_fora: sf,
              existeNoBanco: true,
            },
          }));
        } else {
          setPalpites((prev) => {
            const next = { ...prev };
            delete next[jogoId];
            return next;
          });
        }

        const rec = await verificarECarregarPalpitesBolao(
          participante.email,
          participante.inscricao_id,
        );
        if (rec.ok) {
          aplicarRespostaServidor(rec);
        }

        dispararFlashSalvo(jogoId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErro(msg || "Falha ao salvar o palpite.");
      } finally {
        setSalvandoJogoId(null);
      }
    },
    [
      aplicarRespostaServidor,
      confirmado,
      dispararFlashSalvo,
      dispararPalpiteSalvoDbMsg,
      participante,
      palpites,
      relogio,
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

    if (!participante.inscricao_id.trim()) {
      setErro("Sessão inválida ou expirada. Faça login novamente.");
      return;
    }

    for (const j of COPA2026_JOGOS) {
      const c = palpites[j.id]?.placar_casa ?? "";
      const f = palpites[j.id]?.placar_fora ?? "";
      const tem =
        sanitizarPlacar(String(c)).length > 0 ||
        sanitizarPlacar(String(f)).length > 0;

      if (tem && !copa2026PalpitesAbertosParaJogo(j.id, relogio)) {
        setErro(MSG_PALPITES_ENCERRADOS_JOGO);
        return;
      }

      if (tem && !placarFormularioCompleto({ casa: c, fora: f })) {
        setErro(MSG_PLACAR_INCOMPLETO);
        return;
      }
    }

    setErro("");
    setSucessoSalvos(false);
    setConfirmandoTodos(true);

    try {
      const placaresPayload: Record<string, { casa: string; fora: string }> =
        {};
      for (const j of COPA2026_JOGOS) {
        placaresPayload[j.id] = {
          casa: sanitizarPlacar(palpites[j.id]?.placar_casa ?? ""),
          fora: sanitizarPlacar(palpites[j.id]?.placar_fora ?? ""),
        };
      }

      const res = await salvarPalpitesBolao(
        participante.email,
        participante.inscricao_id,
        placaresPayload,
        { confirmar: true },
      );

      if (!res.ok) {
        setErro(res.error);
        alert("Erro ao confirmar todos: " + res.error);
        return;
      }

      setConfirmado(true);
      const rec = await verificarECarregarPalpitesBolao(
        participante.email,
        participante.inscricao_id,
      );
      if (rec.ok) {
        aplicarRespostaServidor(rec);
      }
      dispararSucessoSalvos();
      alert("Todos os palpites foram confirmados.");
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      setErro(error.message);
      alert("Erro geral ao confirmar todos: " + error.message);
    } finally {
      setConfirmandoTodos(false);
    }
  }, [
    aplicarRespostaServidor,
    confirmado,
    dispararSucessoSalvos,
    participante,
    palpites,
    relogio,
  ]);

  if (sessaoBolao === "checking") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-black pb-10 pt-2 text-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-zinc-500">Carregando…</p>
          <BolaoSessaoRecoveryPanel
            mensagem="Atalhos"
            detalhe="Se os dados do navegador foram limpos, use as opções abaixo."
          />
          <p className="mt-6 text-sm">
            <a
              href="/bolao"
              className="font-semibold text-[#C9A227] underline-offset-4 hover:underline"
            >
              Ainda não sou inscrito
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (sessaoBolao === "sem_sessao") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-black pb-10 pt-2 text-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-zinc-400">
            Redirecionando para o login do bolão…
          </p>
          <BolaoSessaoRecoveryPanel
            mensagem="Não encontramos sua sessão neste dispositivo"
            detalhe="Você também pode seguir pelos botões abaixo."
          />
          <p className="mt-6 text-sm">
            <a
              href="/bolao"
              className="font-semibold text-[#C9A227] underline-offset-4 hover:underline"
            >
              Ainda não sou inscrito
            </a>
          </p>
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

              <a
                href="/bolao"
                className="shrink-0 rounded border border-zinc-800 bg-[#111] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-zinc-400 hover:border-yellow-600/50 hover:text-yellow-500"
              >
                Voltar à inscrição
              </a>
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

            {erro ? (
              <p className="mb-2 rounded border border-red-500/35 bg-red-950/30 px-2 py-2 text-xs text-red-300">
                {erro}
              </p>
            ) : null}

            <div
              role="status"
              aria-live="polite"
              className={`mb-3 overflow-hidden transition-all duration-300 ${
                palpiteSalvoDbMsg ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {palpiteSalvoDbMsg ? (
                <div className="rounded border border-emerald-500/40 bg-emerald-950/35 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-emerald-400">
                    {palpiteSalvoDbMsg}
                  </p>
                </div>
              ) : null}
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`mb-3 overflow-hidden transition-all duration-300 ${
                sucessoSalvos
                  ? "max-h-16 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {sucessoSalvos && (
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
                        const aberto = copa2026PalpitesAbertosParaJogo(
                          jogo.id,
                          relogio,
                        );

                        const placarCasa =
                          palpites[jogo.id]?.placar_casa ?? "";
                        const placarVisitante =
                          palpites[jogo.id]?.placar_fora ?? "";

                        const palpiteEnviado = Boolean(
                          palpites[jogo.id]?.existeNoBanco,
                        );

                        return (
                          <Copa2026PalpiteCard
                            key={jogo.id}
                            jogo={jogo}
                            placarCasa={placarCasa}
                            placarVisitante={placarVisitante}
                            onPlacarChange={onPlacarChange}
                            onSalvarPalpite={(jg) => {
                              void salvarPalpite(jg).catch((err) => {
                                setErro(
                                  err instanceof Error
                                    ? err.message
                                    : String(err),
                                );
                              });
                            }}
                            salvoFlash={Boolean(salvoFlash[jogo.id])}
                            bloquearEdicao={confirmado}
                            salvandoPalpite={salvandoJogoId === jogo.id}
                            prazoPalpites={{
                              encerrado: !aberto,
                              tempoRestante: aberto
                                ? copa2026PalpitesTextoTempoRestante(
                                    jogo.id,
                                    relogio,
                                  )
                                : null,
                            }}
                            palpiteSalvoNoServidor={palpiteEnviado}
                            pontuacaoBolao={montarPontuacaoCard(jogo.id, {
                              casa: placarCasa,
                              fora: placarVisitante,
                            })}
                          />
                        );
                      })}
                    </div>
                  </section>
                ))}

                <div className="mt-4 border-t-2 border-yellow-500/40 pt-3">
                  <button
                    type="button"
                    disabled={!hydrated || confirmandoTodos || confirmado}
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
