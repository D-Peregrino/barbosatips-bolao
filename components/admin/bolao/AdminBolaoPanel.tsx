"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  mergeJogosComOverrides,
  type BolaoJogoOverrideRow,
} from "@/lib/admin/bolao-jogos-merged";
import { pontuacaoPalpiteContraResultado } from "@/lib/bolao/pontuacao-palpite";
import {
  COPA2026_JOGOS,
  copa2026SelecaoPorId,
  type StatusPalpiteJogo,
} from "@/lib/mocks/copa2026-groupstage.mock";
import { createClient } from "@/lib/supabase/client";
import {
  carregarResultadosSalvosBolao,
  salvarJogoOverrideAdmin,
  salvarResultadoOficialBolao,
  type BolaoResultadoOficialRow,
} from "@/app/admin/bolao/actions";
import { logoutAdminBolaoAction } from "@/app/admin/bolao/auth-actions";

type Inscrito = {
  id: string;
  nome: string;
  email: string;
};

type PalpiteBolaoRow = {
  id: string;
  inscricao_id: string;
  jogo_id: string;
  placar_casa: number | null;
  placar_fora: number | null;
  inscricao_nome: string | null;
};

type ResultadoRow = BolaoResultadoOficialRow;

type JogoDraft = {
  dataISO: string;
  horario: string;
  status: StatusPalpiteJogo;
  placarCasa: string;
  placarFora: string;
};

/** PostgREST pode devolver números como string; o ranking exige `number` finito. */
function normalizarResultadoRows(raw: unknown[] | null | undefined): ResultadoRow[] {
  const out: ResultadoRow[] = [];
  for (const row of raw ?? []) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const jogoId = String(r.jogo_id ?? "").trim();
    if (!jogoId) continue;
    const casa = Number(r.placar_casa_real);
    const fora = Number(r.placar_fora_real);
    if (!Number.isInteger(casa) || !Number.isInteger(fora)) continue;
    if (casa < 0 || casa > 99 || fora < 0 || fora > 99) continue;
    const st = r.status;
    out.push({
      jogo_id: jogoId,
      placar_casa_real: casa,
      placar_fora_real: fora,
      status:
        st === undefined || st === null ? undefined : String(st).trim() || undefined,
    });
  }
  return out;
}

/** Uma linha retornada pelo upsert (serialização server action). */
function normalizarLinhaResultado(raw: unknown): ResultadoRow | null {
  const rows = normalizarResultadoRows(raw == null ? [] : [raw as unknown]);
  return rows[0] ?? null;
}

function mergeResultadosList(
  anterior: ResultadoRow[],
  novos: ResultadoRow[],
): ResultadoRow[] {
  const m = new Map(anterior.map((x) => [x.jogo_id, x]));
  for (const r of novos) m.set(r.jogo_id, r);
  return Array.from(m.values());
}

type JogoPainel = ReturnType<typeof mergeJogosComOverrides>[number] & {
  placar_casa_real: number | null;
  placar_fora_real: number | null;
  resultado_status: string | null;
};

/**
 * Reconstrói drafts e lista de jogos (placar + status do resultado) sem perder campos da linha.
 */
function buildListaJogos(
  overrides: BolaoJogoOverrideRow[],
  resRows: ResultadoRow[],
  prevDrafts: Record<string, JogoDraft> | null,
): { jogos: JogoPainel[]; drafts: Record<string, JogoDraft> } {
  const merged = mergeJogosComOverrides(overrides);
  const rm = new Map(resRows.map((r) => [r.jogo_id, r]));
  const drafts: Record<string, JogoDraft> = {};
  const jogos: JogoPainel[] = merged.map((j) => {
    const r = rm.get(j.id);
    const p = prevDrafts?.[j.id];
    const placarCasa =
      r != null ? String(r.placar_casa_real) : (p?.placarCasa ?? "");
    const placarFora =
      r != null ? String(r.placar_fora_real) : (p?.placarFora ?? "");
    drafts[j.id] = {
      dataISO: p?.dataISO ?? j.dataISO,
      horario: p?.horario ?? j.horario,
      status: p?.status ?? j.status,
      placarCasa,
      placarFora,
    };
    return {
      ...j,
      placar_casa_real: r?.placar_casa_real ?? null,
      placar_fora_real: r?.placar_fora_real ?? null,
      resultado_status: r?.status ?? null,
    };
  });
  return { jogos, drafts };
}

function extrairInscricaoEmbed(
  row: Record<string, unknown>,
): { nome: string | null } {
  const raw = row.inscricoes_bolao;
  if (!raw || typeof raw !== "object") return { nome: null };
  const o = raw as Record<string, unknown>;
  const nome = o.nome;
  if (nome === undefined || nome === null) return { nome: null };
  const s = String(nome).trim();
  return { nome: s || null };
}

function mapPalpiteRow(row: Record<string, unknown>): PalpiteBolaoRow {
  const emb = extrairInscricaoEmbed(row);
  const pc = row.placar_casa;
  const pf = row.placar_fora;
  return {
    id: String(row.id),
    inscricao_id: String(row.inscricao_id),
    jogo_id: String(row.jogo_id),
    placar_casa:
      pc === null || pc === undefined || pc === ""
        ? null
        : typeof pc === "number"
          ? pc
          : parseInt(String(pc), 10) || null,
    placar_fora:
      pf === null || pf === undefined || pf === ""
        ? null
        : typeof pf === "number"
          ? pf
          : parseInt(String(pf), 10) || null,
    inscricao_nome: emb.nome,
  };
}

type AdminBolaoPanelProps = {
  /** Resultados já lidos no servidor (SSR); o cliente chama `carregarResultadosSalvos` no mount. */
  initialResultados?: BolaoResultadoOficialRow[];
};

export function AdminBolaoPanel({
  initialResultados = [],
}: AdminBolaoPanelProps) {
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Só a linha em gravação fica “travada”; evita painel inteiro escuro. */
  const [salvandoJogoId, setSalvandoJogoId] = useState<string | null>(null);
  const [salvandoResultadoId, setSalvandoResultadoId] = useState<string | null>(null);
  const [feedbackOk, setFeedbackOk] = useState<string | null>(null);
  const [feedbackErr, setFeedbackErr] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [palpites, setPalpites] = useState<PalpiteBolaoRow[]>([]);
  const [overrides, setOverrides] = useState<BolaoJogoOverrideRow[]>([]);
  const [resultados, setResultados] = useState<ResultadoRow[]>(
    () => initialResultados,
  );
  const [jogos, setJogos] = useState<JogoPainel[]>(() =>
    buildListaJogos([], initialResultados, null).jogos,
  );
  const [drafts, setDrafts] = useState<Record<string, JogoDraft>>(() =>
    buildListaJogos([], initialResultados, null).drafts,
  );

  const overridesRef = useRef(overrides);
  const resultadosRef = useRef(resultados);
  const draftsRef = useRef(drafts);
  overridesRef.current = overrides;
  resultadosRef.current = resultados;
  draftsRef.current = drafts;

  const resultadoMap = useMemo(() => {
    const m = new Map<string, ResultadoRow>();
    for (const r of resultados) m.set(r.jogo_id, r);
    return m;
  }, [resultados]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(null), 3500);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  /**
   * Recarrega `bolao_resultados_teste` via server action (service role) e reconstrói jogos/drafts.
   * `linhaGarantida`: mescla por cima do fetch (evita lista vazia / lag logo após upsert).
   * Retorna `null` se ok, ou mensagem de erro.
   */
  const carregarResultadosSalvos = useCallback(
    async (
      linhaGarantida?: ResultadoRow | null,
      opts?: { resetDrafts?: boolean },
    ): Promise<string | null> => {
      const resSrv = await carregarResultadosSalvosBolao();
      if (!resSrv.ok) {
        console.error("ERRO AO CARREGAR RESULTADOS", resSrv.error);
        return resSrv.error;
      }

      const resNext = normalizarResultadoRows(resSrv.rows as unknown[]);
      const merged = linhaGarantida
        ? mergeResultadosList(resNext, [linhaGarantida])
        : resNext;

      setResultados(merged);
      const prevDrafts = opts?.resetDrafts ? null : draftsRef.current;
      const built = buildListaJogos(
        overridesRef.current,
        merged,
        prevDrafts,
      );
      setJogos(built.jogos);
      setDrafts(built.drafts);
      draftsRef.current = built.drafts;
      resultadosRef.current = merged;
      return null;
    },
    [],
  );

  const carregarRanking = useCallback(async (): Promise<boolean> => {
    let sb: ReturnType<typeof createClient>;
    try {
      sb = createClient();
    } catch (e) {
      console.error("ERRO AO CARREGAR RANKING", e);
      return false;
    }

    const [insRes, palRes] = await Promise.all([
      sb
        .from("inscricoes_bolao")
        .select("id,nome,email")
        .order("created_at", { ascending: false }),
      sb
        .from("palpites_bolao")
        .select(
          "id,inscricao_id,jogo_id,placar_casa,placar_fora,inscricoes_bolao(nome)",
        )
        .order("created_at", { ascending: false }),
    ]);

    if (insRes.error) {
      console.error("ERRO AO CARREGAR RANKING", insRes.error);
      return false;
    }
    if (palRes.error) {
      console.error("ERRO AO CARREGAR RANKING", palRes.error);
      return false;
    }

    const insRows = (insRes.data ?? []) as Record<string, unknown>[];
    const inscritosNext: Inscrito[] = insRows.map((r) => ({
      id: String(r.id),
      nome: String(r.nome ?? "").trim() || "—",
      email: String(r.email ?? "").trim() || "—",
    }));
    const palRows = (palRes.data ?? []) as Record<string, unknown>[];
    setInscritos(inscritosNext);
    setPalpites(palRows.map(mapPalpiteRow));
    return true;
  }, []);

  const reload = useCallback(async () => {
    setLoadError(null);
    let sb: ReturnType<typeof createClient>;
    try {
      sb = createClient();
    } catch {
      setLoadError(
        "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    const [insRes, palRes, ovRes] = await Promise.all([
      sb
        .from("inscricoes_bolao")
        .select("id,nome,email")
        .order("created_at", { ascending: false }),
      sb
        .from("palpites_bolao")
        .select(
          "id,inscricao_id,jogo_id,placar_casa,placar_fora,inscricoes_bolao(nome)",
        )
        .order("created_at", { ascending: false }),
      sb.from("bolao_jogo_admin_override").select("*"),
    ]);

    if (insRes.error) {
      setLoadError(insRes.error.message);
      return;
    }
    if (palRes.error) {
      setLoadError(palRes.error.message);
      return;
    }
    if (ovRes.error) {
      setLoadError(
        `${ovRes.error.message} (tabela bolao_jogo_admin_override — aplique a migração 005 se necessário)`,
      );
      return;
    }

    const insRows = (insRes.data ?? []) as Record<string, unknown>[];
    const inscritosNext: Inscrito[] = insRows.map((r) => ({
      id: String(r.id),
      nome: String(r.nome ?? "").trim() || "—",
      email: String(r.email ?? "").trim() || "—",
    }));

    const palRows = (palRes.data ?? []) as Record<string, unknown>[];
    const palpitesNext = palRows.map(mapPalpiteRow);

    const ovNext = (ovRes.data ?? []) as BolaoJogoOverrideRow[];

    setInscritos(inscritosNext);
    setPalpites(palpitesNext);
    setOverrides(ovNext);
    overridesRef.current = ovNext;

    const errRes = await carregarResultadosSalvos(null, { resetDrafts: true });
    if (errRes) {
      setLoadError(errRes);
      return;
    }
  }, [carregarResultadosSalvos]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const totalEncerrados = useMemo(
    () => jogos.filter((j) => j.status === "encerrado").length,
    [jogos],
  );

  const totalComResultadoOficial = resultados.length;

  const totalPalpitesPorInscricao = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of palpites) {
      m.set(p.inscricao_id, (m.get(p.inscricao_id) ?? 0) + 1);
    }
    return m;
  }, [palpites]);

  const rankingRows = useMemo(() => {
    const acc = new Map<
      string,
      { pontos: number; exatos: number; jogosComResultado: number }
    >();

    for (const p of palpites) {
      const ro = resultadoMap.get(p.jogo_id);
      if (!ro) continue;
      const pts = pontuacaoPalpiteContraResultado(
        ro.placar_casa_real,
        ro.placar_fora_real,
        p.placar_casa,
        p.placar_fora,
      );
      const cur = acc.get(p.inscricao_id) ?? {
        pontos: 0,
        exatos: 0,
        jogosComResultado: 0,
      };
      cur.pontos += pts;
      if (pts === 3) cur.exatos++;
      cur.jogosComResultado++;
      acc.set(p.inscricao_id, cur);
    }

    const rows = inscritos.map((ins) => {
      const a = acc.get(ins.id);
      return {
        id: ins.id,
        nome: ins.nome,
        pontos: a?.pontos ?? 0,
        acertosExatos: a?.exatos ?? 0,
        palpitesTotais: totalPalpitesPorInscricao.get(ins.id) ?? 0,
      };
    });

    rows.sort((x, y) => {
      if (y.pontos !== x.pontos) return y.pontos - x.pontos;
      if (y.acertosExatos !== x.acertosExatos) return y.acertosExatos - x.acertosExatos;
      return x.nome.localeCompare(y.nome, "pt-BR");
    });

    return rows.map((r, i) => ({ ...r, posicao: i + 1 }));
  }, [inscritos, palpites, resultadoMap, totalPalpitesPorInscricao]);

  async function handleSalvarJogo(jogoId: string) {
    const d = drafts[jogoId];
    if (!d) return;
    setSalvandoJogoId(jogoId);
    setFeedbackOk(null);
    setFeedbackErr(null);
    try {
      const res = await salvarJogoOverrideAdmin({
        jogoId,
        dataIso: d.dataISO.trim() || null,
        horario: d.horario.trim() || null,
        statusManual: d.status,
        inicioPartidaIso: null,
      });
      if (!res.ok) {
        setFeedbackErr(res.error);
        return;
      }
      setFeedbackOk("Jogo atualizado.");
      await reload();
    } finally {
      setSalvandoJogoId(null);
    }
  }

  async function handleSalvarResultado(jogoId: string) {
    const d = drafts[jogoId];
    if (!d) return;
    const c = parseInt(d.placarCasa.trim(), 10);
    const f = parseInt(d.placarFora.trim(), 10);
    if (!Number.isFinite(c) || !Number.isFinite(f)) {
      setFeedbackErr("Informe placares válidos (inteiros).");
      setFeedbackOk(null);
      return;
    }

    const payload = {
      jogo_id: jogoId,
      placar_casa_real: c,
      placar_fora_real: f,
      status: "finalizado" as const,
    };
    console.log("ANTES DO UPSERT", payload);

    setSalvandoResultadoId(jogoId);
    setFeedbackOk(null);
    setFeedbackErr(null);

    try {
      const res = await salvarResultadoOficialBolao({
        jogoId: payload.jogo_id,
        placarCasaReal: payload.placar_casa_real,
        placarForaReal: payload.placar_fora_real,
      });
      if (!res.ok) {
        const err = new Error(res.error);
        console.error("ERRO AO SALVAR RESULTADO", err);
        setFeedbackErr(err.message);
        return;
      }

      console.log("DEPOIS DO UPSERT", res.data);

      const linha =
        normalizarLinhaResultado(res.data) ?? {
          jogo_id: jogoId,
          placar_casa_real: c,
          placar_fora_real: f,
          status: "finalizado",
        };

      flushSync(() => {
        const mergedRes = mergeResultadosList(resultadosRef.current, [linha]);
        const built = buildListaJogos(
          overridesRef.current,
          mergedRes,
          draftsRef.current,
        );
        setResultados(mergedRes);
        setDrafts(built.drafts);
        setJogos(() =>
          built.jogos.map((j) =>
            j.id === jogoId
              ? {
                  ...j,
                  placar_casa_real: linha.placar_casa_real,
                  placar_fora_real: linha.placar_fora_real,
                  resultado_status: linha.status ?? "finalizado",
                }
              : j,
          ),
        );
        draftsRef.current = built.drafts;
        resultadosRef.current = mergedRes;
      });

      await carregarResultadosSalvos(linha);
      await carregarRanking();

      queueMicrotask(() => {
        setToastMsg("Resultado salvo");
      });
      setFeedbackOk(null);
      setFeedbackErr(null);
    } catch (error) {
      console.error("ERRO AO SALVAR RESULTADO", error);
      setFeedbackErr(
        error instanceof Error
          ? error.message
          : "Falha ao salvar resultado.",
      );
    } finally {
      setSalvandoResultadoId(null);
    }
  }

  function updateDraft(jogoId: string, patch: Partial<JogoDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], ...patch },
    }));
  }

  if (loadError && !inscritos.length && !palpites.length) {
    return (
      <div className="min-h-screen bg-[#050608] px-4 py-12 text-white">
        <p className="text-center text-red-400">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.22), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-4 border-b border-[#3d3420]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
              BarbosaTips · Admin Bolão
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              Copa 2026 — painel
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Inscrições, jogos, resultados oficiais e ranking (3 pts exato · 1 pt
              vencedor/empate).
            </p>
          </div>
          <form action={logoutAdminBolaoAction}>
            <button
              type="submit"
              className="rounded-xl border border-[#5c4d28]/90 bg-[#14120e] px-4 py-2 text-sm font-medium text-[#E8D48B] transition hover:border-[#C9A227]/50"
            >
              Sair
            </button>
          </form>
        </header>

        {loadError ? (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {loadError}
          </p>
        ) : null}
        {feedbackErr ? (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {feedbackErr}
          </p>
        ) : null}
        {feedbackOk ? (
          <p
            className="mt-4 text-sm font-medium text-green-400"
            role="status"
          >
            {feedbackOk}
          </p>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Inscritos", v: inscritos.length },
            { k: "Palpites (linhas)", v: palpites.length },
            { k: "Jogos cadastrados", v: COPA2026_JOGOS.length },
            {
              k: "Jogos encerrados (status)",
              v: totalEncerrados,
            },
          ].map((card) => (
            <div
              key={card.k}
              className="rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-5 backdrop-blur-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {card.k}
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#F0D78C]">
                {card.v}
              </p>
            </div>
          ))}
        </section>

        <p className="mt-3 text-xs text-zinc-600">
          Resultados gravados na base:{" "}
          <span className="text-zinc-400">{totalComResultadoOficial}</span> jogos
          com placar oficial em{" "}
          <code className="text-[#C9A227]/80">bolao_resultados_teste</code>.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-bold text-white">Ranking</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pontuação usa apenas jogos com resultado oficial salvo.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#3d3420]/90">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#14120e] text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3 text-right">Pontos</th>
                  <th className="px-4 py-3 text-right">Exatos</th>
                  <th className="px-4 py-3 text-right">Palpites</th>
                </tr>
              </thead>
              <tbody>
                {rankingRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[#2a2418]/90 odd:bg-[#0c0b09]/50"
                  >
                    <td className="px-4 py-3 text-zinc-400">{r.posicao}</td>
                    <td className="px-4 py-3 font-medium text-white">{r.nome}</td>
                    <td className="px-4 py-3 text-right text-[#E8D48B]">
                      {r.pontos}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {r.acertosExatos}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">
                      {r.palpitesTotais}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-xl font-bold text-white">
            Jogos e resultados
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Edite data, horário e status; salve o resultado oficial para atualizar o
            ranking.
          </p>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#3d3420]/90">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#14120e] text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                <tr>
                  <th className="px-3 py-3">Grupo</th>
                  <th className="px-3 py-3">Jogo</th>
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3">Hora</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Placar real</th>
                  <th className="px-3 py-3 w-[200px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {jogos.map((j) => {
                  const d = drafts[j.id];
                  if (!d) return null;
                  const m = copa2026SelecaoPorId(j.mandanteId);
                  const v = copa2026SelecaoPorId(j.visitanteId);
                  const linhaOcupada =
                    salvandoJogoId === j.id || salvandoResultadoId === j.id;
                  return (
                    <tr
                      key={j.id}
                      className="border-t border-[#2a2418]/90 align-top odd:bg-[#0c0b09]/40"
                    >
                      <td className="px-3 py-3 text-zinc-400">{j.grupo}</td>
                      <td className="px-3 py-3 text-xs leading-snug">
                        <span className="text-white">
                          {m.bandeira} {m.nome}
                        </span>
                        <span className="text-zinc-600"> × </span>
                        <span className="text-white">
                          {v.bandeira} {v.nome}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="date"
                          value={d.dataISO}
                          onChange={(e) =>
                            updateDraft(j.id, { dataISO: e.target.value })
                          }
                          className="w-full max-w-[11rem] rounded-lg border border-[#3d3420] bg-[#050608] px-2 py-1.5 text-xs text-white disabled:opacity-50"
                          disabled={linhaOcupada}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={d.horario}
                          onChange={(e) =>
                            updateDraft(j.id, { horario: e.target.value })
                          }
                          className="w-full max-w-[5.5rem] rounded-lg border border-[#3d3420] bg-[#050608] px-2 py-1.5 text-xs text-white disabled:opacity-50"
                          disabled={linhaOcupada}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={d.status}
                          onChange={(e) =>
                            updateDraft(j.id, {
                              status: e.target.value as StatusPalpiteJogo,
                            })
                          }
                          className="rounded-lg border border-[#3d3420] bg-[#050608] px-2 py-1.5 text-xs text-white disabled:opacity-50"
                          disabled={linhaOcupada}
                        >
                          <option value="aberto">aberto</option>
                          <option value="quase">quase</option>
                          <option value="encerrado">encerrado</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            placeholder="casa"
                            value={d.placarCasa}
                            onChange={(e) =>
                              updateDraft(j.id, {
                                placarCasa: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className="w-14 rounded-lg border border-[#3d3420] bg-[#050608] px-2 py-1.5 text-xs text-white disabled:opacity-50"
                            disabled={linhaOcupada}
                          />
                          <span className="text-zinc-600">×</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            placeholder="fora"
                            value={d.placarFora}
                            onChange={(e) =>
                              updateDraft(j.id, {
                                placarFora: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className="w-14 rounded-lg border border-[#3d3420] bg-[#050608] px-2 py-1.5 text-xs text-white disabled:opacity-50"
                            disabled={linhaOcupada}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            disabled={linhaOcupada}
                            onClick={() => void handleSalvarJogo(j.id)}
                            className="rounded-lg border border-[#5c4d28]/90 bg-[#14120e] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#E8D48B] hover:border-[#C9A227]/45 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {salvandoJogoId === j.id ? "Salvando…" : "Salvar jogo"}
                          </button>
                          <button
                            type="button"
                            disabled={linhaOcupada}
                            onClick={() => {
                              console.log("CLICOU SALVAR RESULTADO", j.id);
                              void handleSalvarResultado(j.id);
                            }}
                            className="rounded-lg bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#0a0a0a] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {salvandoResultadoId === j.id
                              ? "Salvando…"
                              : "Salvar resultado"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {toastMsg ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-green-500/40 bg-[#0a1a0f]/95 px-5 py-3 text-sm font-medium text-green-400 shadow-lg backdrop-blur-sm"
          role="status"
        >
          {toastMsg}
        </div>
      ) : null}
    </div>
  );
}
