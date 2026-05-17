"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const CHECKOUT_BOLAO_COPA_HREF = "/checkout/bolao_copa";

const MSG_CONFIRMADOS = "Palpites confirmados com sucesso";
const MSG_SALVOS_SUPABASE = "Palpites salvos com sucesso.";
const MSG_PALPITE_SALVO_DB = "Palpite salvo no banco de dados.";
const MSG_PLACAR_INCOMPLETO =
  "Informe o placar do mandante e do visitante antes de salvar.";

const MSG_AVISO_PAGAMENTO_PALPITES =
  "Pagamento pendente. Finalize sua inscrição para liberar os palpites.";

const BOLAO_PARTICIPANTE_LS = "barbosatips:bolao:participante";

/** Só `true` após linha real em `palpites_bolao` (SELECT / refetch pós-salvar). */
type CelulaPalpite = {
  placar_casa: string;
  placar_fora: string;
  existeNoBanco: boolean;
};

type ParticipanteBolao = {
  inscricao_id: string;
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

function lerParticipanteLocal(): (ParticipanteBolao & { pago?: boolean }) | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = localStorage.getItem(BOLAO_PARTICIPANTE_LS);
    if (!bruto) return null;
    const p = JSON.parse(bruto) as {
      inscricao_id?: unknown;
      nome?: unknown;
      email?: unknown;
      pago?: unknown;
    };
    const inscricao_id = String(p.inscricao_id ?? "").trim();
    const nome = String(p.nome ?? "").trim();
    const email = String(p.email ?? "").trim().toLowerCase();
    if (!inscricao_id || !nome || !email || !email.includes("@")) return null;
    const pago =
      p.pago === true || p.pago === false ? Boolean(p.pago) : undefined;
    return { inscricao_id, nome, email, pago };
  } catch {
    return null;
  }
}

function persistirParticipanteLs(
  participante: ParticipanteBolao,
  pago: boolean,
): void {
  try {
    localStorage.setItem(
      BOLAO_PARTICIPANTE_LS,
      JSON.stringify({
        inscricao_id: participante.inscricao_id,
        nome: participante.nome,
        email: participante.email,
        pago,
      }),
    );
  } catch {
    // ignore
  }
}

function mesclarPalpitesServidorComLocal(
  res: {
    placares: Record<string, { casa: string; fora: string }>;
    palpitePersistidoPorJogo: Record<string, boolean>;
  },
  prev: Record<string, CelulaPalpite>,
): Record<string, CelulaPalpite> {
  const base = montarPalpitesAPartirDoServidor(res);
  const out: Record<string, CelulaPalpite> = { ...base };
  for (const j of COPA2026_JOGOS) {
    const lac = prev[j.id];
    if (lac && !lac.existeNoBanco && !base[j.id]) {
      out[j.id] = { ...lac, existeNoBanco: false };
    }
  }
  return out;
}

export default function BolaoPalpitesPage() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [participante, setParticipante] = useState<ParticipanteBolao | null>(
    null,
  );
  /** `null` = ainda não sincronizado com o servidor nesta sessão de página. */
  const [pago, setPago] = useState<boolean | null>(null);

  const [palpites, setPalpites] = useState<Record<string, CelulaPalpite>>({});
  const [confirmado, setConfirmado] = useState(false);

  const [msgConfirmados, setMsgConfirmados] = useState(false);
  const [sucessoSalvos, setSucessoSalvos] = useState(false);
  const [palpiteSalvoDbMsg, setPalpiteSalvoDbMsg] = useState("");
  const [salvoFlash, setSalvoFlash] = useState<Record<string, boolean>>({});

  const [erro, setErro] = useState("");

  const [salvandoJogoId, setSalvandoJogoId] = useState<string | null>(null);
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);

  const grupos = useMemo(() => copa2026JogosPorGrupo(), []);

  const aplicarRespostaServidor = useCallback(
    (
      res: {
        ok: true;
        placares: Record<string, { casa: string; fora: string }>;
        confirmado: boolean;
        pago: boolean;
        palpitePersistidoPorJogo: Record<string, boolean>;
      },
      participanteAtual: ParticipanteBolao,
    ) => {
      setPalpites((prev) => mesclarPalpitesServidorComLocal(res, prev));
      setConfirmado(res.confirmado);
      setPago(res.pago);
      persistirParticipanteLs(participanteAtual, res.pago);
    },
    [],
  );

  useEffect(() => {
    let vivo = true;

    async function carregarUmaVez() {
      try {
        const ls = lerParticipanteLocal();
        if (!ls) {
          if (!vivo) return;
          setParticipante(null);
          setPago(null);
          setPalpites({});
          setConfirmado(false);
          setErro("");
          return;
        }

        const { pago: pagoLs, ...part } = ls;
        if (!vivo) return;
        setParticipante(part);
        if (typeof pagoLs === "boolean") {
          setPago(pagoLs);
        } else {
          setPago(null);
        }

        setErro("");
        const res = await verificarECarregarPalpitesBolao(
          part.email,
          part.inscricao_id,
        );
        if (!vivo) return;

        if (!res.ok) {
          setErro(res.error);
          return;
        }

        aplicarRespostaServidor(res, part);
      } catch (e) {
        if (vivo) {
          const msg = e instanceof Error ? e.message : String(e);
          setErro(msg || "Falha ao carregar palpites.");
        }
      } finally {
        if (vivo) {
          setCarregando(false);
        }
      }
    }

    void carregarUmaVez();

    return () => {
      vivo = false;
    };
  }, [aplicarRespostaServidor]);

  function handleSair() {
    try {
      localStorage.removeItem(BOLAO_PARTICIPANTE_LS);
    } catch {
      // ignore
    }
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    setParticipante(null);
    setPago(null);
    setPalpites({});
    router.replace("/bolao/login");
  }

  const agora = Date.now();

  const onPlacarChange = useCallback(
    (jogoId: string, campo: "casa" | "fora", valor: string) => {
      if (!copa2026PalpitesAbertosParaJogo(jogoId, Date.now())) return;
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
    [],
  );

  const salvarPalpite = useCallback(
    async (jogo: JogoCopa2026Resolvido) => {
      const jogoId = String(jogo?.id ?? "");
      const t = Date.now();

      if (!participante) {
        setErro("Sessão inválida ou expirada. Faça login novamente.");
        return;
      }

      if (
        copa2026DevPalpiteBloqueioAtivo() &&
        jogoId === COPA2026_DEV_PALPITE_BLOQUEIO_ID
      ) {
        return;
      }

      if (pago === false) {
        setErro(MSG_AVISO_PAGAMENTO_PALPITES);
        return;
      }

      if (confirmado) {
        setErro("Os palpites já foram confirmados e não podem mais ser alterados.");
        return;
      }

      if (!copa2026PalpitesAbertosParaJogo(jogoId, t)) {
        setErro(MSG_PALPITES_ENCERRADOS_JOGO);
        return;
      }

      if (!participante.inscricao_id.trim()) {
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
        setPalpiteSalvoDbMsg(MSG_PALPITE_SALVO_DB);

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
          aplicarRespostaServidor(rec, participante);
        }

        setSalvoFlash((s) => ({ ...s, [jogoId]: true }));
        queueMicrotask(() => {
          setSalvoFlash((s) => ({ ...s, [jogoId]: false }));
        });
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
      pago,
      participante,
      palpites,
    ],
  );

  const confirmarTodos = useCallback(async () => {
    const t = Date.now();
    if (confirmado) {
      setMsgConfirmados(true);
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

    if (pago === false) {
      setErro(MSG_AVISO_PAGAMENTO_PALPITES);
      return;
    }

    for (const j of COPA2026_JOGOS) {
      const c = palpites[j.id]?.placar_casa ?? "";
      const f = palpites[j.id]?.placar_fora ?? "";
      const tem =
        sanitizarPlacar(String(c)).length > 0 ||
        sanitizarPlacar(String(f)).length > 0;

      if (tem && !copa2026PalpitesAbertosParaJogo(j.id, t)) {
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
    setMsgConfirmados(false);
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
        aplicarRespostaServidor(rec, participante);
      }
      setSucessoSalvos(true);
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
    pago,
    participante,
    palpites,
  ]);

  const pagoBloqueiaPalpites = pago === false;
  const mostrarAvisoPagamento = pagoBloqueiaPalpites && !carregando;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black pb-10 pt-2 text-zinc-200">
      <div className="mx-auto max-w-5xl px-2 sm:px-3 lg:max-w-[1280px] lg:px-8 xl:max-w-[1360px] xl:px-10">
        {!participante && carregando ? (
          <div className="py-16 text-center sm:px-6">
            <p className="text-sm text-zinc-500">Carregando sessão…</p>
          </div>
        ) : !participante ? (
          <div className="py-10 text-center sm:px-6">
            <p className="text-sm text-zinc-400">
              Para ver os palpites, entre com sua sessão do bolão.
            </p>
            <BolaoSessaoRecoveryPanel
              mensagem="Não encontramos sua sessão neste dispositivo"
              detalhe="Use os atalhos abaixo para fazer inscrição ou login."
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
        ) : (
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
                  Voltar
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
                  {carregando ? (
                    <p className="mt-2 text-[11px] text-zinc-500">
                      Sincronizando com o servidor…
                    </p>
                  ) : null}
                  {mostrarAvisoPagamento ? (
                    <div
                      className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2.5 sm:px-4 sm:py-3"
                      role="status"
                    >
                      <p className="text-sm font-semibold leading-snug text-amber-100">
                        {MSG_AVISO_PAGAMENTO_PALPITES}
                      </p>
                      <a
                        href={CHECKOUT_BOLAO_COPA_HREF}
                        className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-[#C9A227]/60 bg-gradient-to-r from-[#e8c96b]/90 via-[#d4af37]/90 to-[#b8922b]/90 px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.1em] text-black shadow-sm transition hover:brightness-105 sm:text-xs"
                      >
                        Pagar inscrição
                      </a>
                    </div>
                  ) : null}
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

              {palpiteSalvoDbMsg ? (
                <div className="mb-3 rounded border border-emerald-500/40 bg-emerald-950/35 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-emerald-400">
                    {palpiteSalvoDbMsg}
                  </p>
                </div>
              ) : null}

              {sucessoSalvos ? (
                <div className="mb-3 rounded border border-emerald-500/40 bg-emerald-950/35 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-emerald-400">
                    {MSG_SALVOS_SUPABASE}
                  </p>
                </div>
              ) : null}

              {msgConfirmados ? (
                <div className="mb-3 rounded border border-yellow-600/40 bg-yellow-500/10 px-2 py-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wide text-yellow-400">
                    {MSG_CONFIRMADOS}
                  </p>
                </div>
              ) : null}

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
                        agora,
                      );

                      const placarCasa = palpites[jogo.id]?.placar_casa ?? "";
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
                          pagamentoPendente={pagoBloqueiaPalpites}
                          salvandoPalpite={salvandoJogoId === jogo.id}
                          prazoPalpites={{
                            encerrado: !aberto,
                            tempoRestante: aberto
                              ? copa2026PalpitesTextoTempoRestante(
                                  jogo.id,
                                  agora,
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
                  disabled={
                    !participante ||
                    carregando ||
                    confirmandoTodos ||
                    confirmado ||
                    pagoBloqueiaPalpites
                  }
                  onClick={() => void confirmarTodos()}
                  className="w-full rounded bg-yellow-500 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
                >
                  {confirmandoTodos
                    ? "Confirmando…"
                    : "Confirmar todos os palpites"}
                </button>
              </div>
            </div>

            <div className="mt-5 lg:sticky lg:top-20 lg:mt-0">
              <Copa2026PalpitesSidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
