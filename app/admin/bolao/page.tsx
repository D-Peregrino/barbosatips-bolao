"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  copa2026JogosPorGrupo,
  copa2026JogosResolvidos,
} from "@/lib/mocks/copa2026-groupstage.mock";
import { pontuacaoPalpiteContraResultado } from "@/lib/bolao/pontuacao-palpite";
import { salvarResultadoTesteBolao } from "@/app/admin/bolao/actions";

const SUPABASE_URL = "https://blrlplzjlnofhivtydxt.supabase.co";
const SUPABASE_KEY = "sb_publishable_mSK2fm2fX3YBbyJvsjEbEg_hF3RXYLb";

/** Senha temporária fixa no cliente (substituir por fluxo seguro depois). */
const ADMIN_PASSWORD_FIXA = "Venados11";

/** Chave no localStorage quando o admin está autenticado neste navegador. */
const STORAGE_ADMIN_SESSION = "barbosatips_admin_bolao_session";

type Inscrito = {
  id: string;
  nome: string;
  email: string;
  status_pagamento: string | null;
  valor_pago: number | string | null;
  link_pagamento: string | null;
  created_at?: string | null;
};

type PalpiteBolaoRow = {
  id: string;
  inscricao_id: string;
  jogo_id: string;
  placar_casa: number | null;
  placar_fora: number | null;
  created_at: string | null;
  /** Preenchido quando a API retorna embed `inscricoes_bolao(...)`. */
  inscricao_nome: string | null;
  inscricao_email: string | null;
};

type ResultadoTesteRow = {
  jogo_id: string;
  placar_casa_real: number;
  placar_fora_real: number;
};

const HEADERS_REST = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: "application/json",
} as const;

function moedaBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseValor(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function numeroPalpiteSupabase(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function encurtarUrl(texto: string, max: number) {
  const t = texto.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.floor(max / 2))}…${t.slice(-Math.floor(max / 2))}`;
}

function formatarDataHoraPalpite(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function extrairInscricaoEmbed(
  row: Record<string, unknown>,
): { nome: string | null; email: string | null } {
  const raw = row.inscricoes_bolao;
  if (!raw || typeof raw !== "object") {
    return { nome: null, email: null };
  }
  const o = raw as Record<string, unknown>;
  const nome = o.nome;
  const email = o.email;
  return {
    nome:
      nome === undefined || nome === null ? null : String(nome).trim() || null,
    email:
      email === undefined || email === null
        ? null
        : String(email).trim() || null,
  };
}

/** Garante ordem mais recente primeiro (PostgREST + fallback). */
function ordenarPalpitesPorCreatedAtDesc(rows: PalpiteBolaoRow[]): PalpiteBolaoRow[] {
  return [...rows].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : NaN;
    const tb = b.created_at ? Date.parse(b.created_at) : NaN;
    if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) {
      return tb - ta;
    }
    if (!Number.isNaN(ta) && Number.isNaN(tb)) return -1;
    if (Number.isNaN(ta) && !Number.isNaN(tb)) return 1;
    return String(b.id).localeCompare(String(a.id));
  });
}

/** Converte qualquer linha do PostgREST para o formato usado na tabela. */
function normalizarInscrito(row: Record<string, unknown>): Inscrito | null {
  const id =
    row.id ??
    row.uuid ??
    row.inscricao_id ??
    row.row_id ??
    row.pk;
  if (id === undefined || id === null || String(id).trim() === "") {
    return null;
  }
  return {
    id: String(id),
    nome: String(row.nome ?? row.name ?? ""),
    email: String(row.email ?? ""),
    status_pagamento:
      row.status_pagamento === undefined || row.status_pagamento === null
        ? null
        : String(row.status_pagamento),
    valor_pago:
      row.valor_pago === undefined || row.valor_pago === null
        ? null
        : (row.valor_pago as number | string),
    link_pagamento:
      row.link_pagamento === undefined || row.link_pagamento === null
        ? null
        : String(row.link_pagamento),
    created_at:
      row.created_at === undefined || row.created_at === null
        ? null
        : String(row.created_at),
  };
}

/** Ordena do mais recente para o mais antigo (created_at; fallback id). */
function ordenarMaisRecentePrimeiro(rows: Inscrito[]): Inscrito[] {
  return [...rows].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : NaN;
    const tb = b.created_at ? Date.parse(b.created_at) : NaN;
    if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) {
      return tb - ta;
    }
    if (!Number.isNaN(ta) && Number.isNaN(tb)) return -1;
    if (Number.isNaN(ta) && !Number.isNaN(tb)) return 1;
    return String(b.id).localeCompare(String(a.id));
  });
}

function ShellBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.25), transparent 55%)",
        }}
      />
      {children}
    </div>
  );
}

export default function AdminBolaoPage() {
  const loadSeqRef = useRef(0);

  const [sessaoOk, setSessaoOk] = useState<boolean | null>(null);
  const [senhaLogin, setSenhaLogin] = useState("");
  const [loginErro, setLoginErro] = useState("");

  const [lista, setLista] = useState<Inscrito[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [salvandoLinkId, setSalvandoLinkId] = useState<string | null>(null);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [copiouId, setCopiouId] = useState<string | null>(null);

  const [palpites, setPalpites] = useState<PalpiteBolaoRow[]>([]);
  const [palpitesCarregando, setPalpitesCarregando] = useState(false);
  const [palpitesErro, setPalpitesErro] = useState("");

  const [resultadosTeste, setResultadosTeste] = useState<ResultadoTesteRow[]>(
    [],
  );
  const [resultadosCarregando, setResultadosCarregando] = useState(false);
  const [resultadosErro, setResultadosErro] = useState("");
  const [draftsResultado, setDraftsResultado] = useState<
    Record<string, { casa: string; fora: string }>
  >({});
  const [salvandoResultadoJogoId, setSalvandoResultadoJogoId] = useState<
    string | null
  >(null);

  useEffect(() => {
    try {
      setSessaoOk(localStorage.getItem(STORAGE_ADMIN_SESSION) === "1");
    } catch {
      setSessaoOk(false);
    }
  }, []);

  useEffect(() => {
    if (sessaoOk === false || sessaoOk === null) {
      setCarregando(false);
    }
  }, [sessaoOk]);

  const carregarInscritos = useCallback(async (): Promise<Inscrito[] | null> => {
    const seq = ++loadSeqRef.current;
    setCarregando(true);
    setErro("");

    const candidatos = [
      "inscricoes_bolao?select=*&order=created_at.desc.nullslast",
      "inscricoes_bolao?select=*&order=created_at.desc",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago,link_pagamento,created_at&order=created_at.desc.nullslast",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago,link_pagamento,created_at&order=created_at.desc",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago,link_pagamento&order=id.desc",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago,link_pagamento",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago&order=created_at.desc.nullslast",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago&order=id.desc",
      "inscricoes_bolao?select=id,nome,email,status_pagamento,valor_pago",
      "inscricoes_bolao?select=*",
    ];

    let ultimoCorpo = "";
    let ultimoStatus = 0;

    try {
      for (const pathQuery of candidatos) {
        if (seq !== loadSeqRef.current) return null;

        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${pathQuery}`, {
          method: "GET",
          headers: { ...HEADERS_REST },
          cache: "no-store",
        });

        ultimoStatus = resposta.status;
        const bruto = (await resposta.text()).replace(/^\uFEFF/, "").trim();
        ultimoCorpo = bruto;

        if (!resposta.ok) {
          continue;
        }

        let parsed: unknown;
        try {
          parsed = bruto.length ? JSON.parse(bruto) : [];
        } catch {
          continue;
        }

        if (!Array.isArray(parsed)) {
          continue;
        }

        const normalizados: Inscrito[] = [];
        for (const item of parsed) {
          if (item && typeof item === "object") {
            const n = normalizarInscrito(item as Record<string, unknown>);
            if (n) normalizados.push(n);
          }
        }

        if (parsed.length > 0 && normalizados.length === 0) {
          continue;
        }

        if (seq !== loadSeqRef.current) return null;

        const ordenados = ordenarMaisRecentePrimeiro(normalizados);
        setLista(ordenados);
        setCarregando(false);
        return ordenados;
      }

      if (seq !== loadSeqRef.current) return null;

      setLista([]);
      setErro(
        ultimoCorpo ||
          `Não foi possível carregar inscritos (HTTP ${ultimoStatus}). Verifique colunas da tabela e políticas RLS para SELECT.`,
      );
      return null;
    } catch (e: unknown) {
      if (seq !== loadSeqRef.current) return null;
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setErro(msg);
      setLista([]);
      return null;
    } finally {
      if (seq === loadSeqRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  const carregarPalpites = useCallback(async () => {
    setPalpitesCarregando(true);
    setPalpitesErro("");

    const candidatos = [
      "palpites_bolao?select=id,inscricao_id,jogo_id,placar_casa,placar_fora,created_at,inscricoes_bolao(nome,email)&order=created_at.desc.nullslast",
      "palpites_bolao?select=id,inscricao_id,jogo_id,placar_casa,placar_fora,created_at,inscricoes_bolao(nome,email)&order=created_at.desc",
      "palpites_bolao?select=id,inscricao_id,jogo_id,placar_casa,placar_fora,created_at&order=created_at.desc.nullslast",
      "palpites_bolao?select=id,inscricao_id,jogo_id,placar_casa,placar_fora,created_at&order=created_at.desc",
      "palpites_bolao?select=*&order=created_at.desc",
      "palpites_bolao?select=*",
    ];

    let ultimoCorpo = "";
    let ultimoStatus = 0;

    try {
      for (const pathQuery of candidatos) {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${pathQuery}`, {
          method: "GET",
          headers: { ...HEADERS_REST },
          cache: "no-store",
        });

        ultimoStatus = resposta.status;
        const bruto = (await resposta.text()).replace(/^\uFEFF/, "").trim();
        ultimoCorpo = bruto;

        if (!resposta.ok) {
          continue;
        }

        let parsed: unknown;
        try {
          parsed = bruto.length ? JSON.parse(bruto) : [];
        } catch {
          continue;
        }

        if (!Array.isArray(parsed)) {
          continue;
        }

        const normalizados: PalpiteBolaoRow[] = [];

        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          const row = item as Record<string, unknown>;
          const id = row.id;
          const inscricao_id = row.inscricao_id;
          const jogo_id = row.jogo_id;
          if (
            id === undefined ||
            id === null ||
            inscricao_id === undefined ||
            inscricao_id === null ||
            jogo_id === undefined ||
            jogo_id === null
          ) {
            continue;
          }
          const c = row.placar_casa;
          const f = row.placar_fora;
          const { nome: embNome, email: embEmail } = extrairInscricaoEmbed(row);
          normalizados.push({
            id: String(id),
            inscricao_id: String(inscricao_id),
            jogo_id: String(jogo_id),
            placar_casa: numeroPalpiteSupabase(c),
            placar_fora: numeroPalpiteSupabase(f),
            created_at:
              row.created_at === undefined || row.created_at === null
                ? null
                : String(row.created_at),
            inscricao_nome: embNome,
            inscricao_email: embEmail,
          });
        }

        setPalpites(ordenarPalpitesPorCreatedAtDesc(normalizados));
        setPalpitesCarregando(false);
        return;
      }

      setPalpites([]);
      setPalpitesErro(
        ultimoCorpo ||
          `Não foi possível carregar palpites (HTTP ${ultimoStatus}). Aplique a migração 003 e confira RLS em palpites_bolao.`,
      );
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setPalpitesErro(msg);
      setPalpites([]);
    } finally {
      setPalpitesCarregando(false);
    }
  }, []);

  const carregarResultadosTeste = useCallback(async () => {
    setResultadosCarregando(true);
    setResultadosErro("");

    const candidatos = [
      "bolao_resultados_teste?select=jogo_id,placar_casa_real,placar_fora_real&order=jogo_id.asc",
      "bolao_resultados_teste?select=*",
    ];

    let ultimoCorpo = "";
    let ultimoStatus = 0;

    try {
      for (const pathQuery of candidatos) {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${pathQuery}`, {
          method: "GET",
          headers: { ...HEADERS_REST },
          cache: "no-store",
        });

        ultimoStatus = resposta.status;
        const bruto = (await resposta.text()).replace(/^\uFEFF/, "").trim();
        ultimoCorpo = bruto;

        if (!resposta.ok) {
          continue;
        }

        let parsed: unknown;
        try {
          parsed = bruto.length ? JSON.parse(bruto) : [];
        } catch {
          continue;
        }

        if (!Array.isArray(parsed)) {
          continue;
        }

        const normalizados: ResultadoTesteRow[] = [];
        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          const row = item as Record<string, unknown>;
          const jogo_id = row.jogo_id;
          if (jogo_id === undefined || jogo_id === null) continue;
          const c = numeroPalpiteSupabase(row.placar_casa_real ?? row.placar_casa);
          const f = numeroPalpiteSupabase(row.placar_fora_real ?? row.placar_fora);
          if (c === null || f === null) continue;
          normalizados.push({
            jogo_id: String(jogo_id),
            placar_casa_real: c,
            placar_fora_real: f,
          });
        }

        setResultadosTeste(normalizados);
        setDraftsResultado((prev) => {
          const next = { ...prev };
          for (const r of normalizados) {
            next[r.jogo_id] = {
              casa: String(r.placar_casa_real),
              fora: String(r.placar_fora_real),
            };
          }
          return next;
        });
        setResultadosCarregando(false);
        return;
      }

      setResultadosTeste([]);
      setResultadosErro(
        ultimoCorpo ||
          `Não foi possível carregar resultados de teste (HTTP ${ultimoStatus}). Aplique a migração 004 (bolao_resultados_teste) e confira RLS.`,
      );
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setResultadosErro(msg);
      setResultadosTeste([]);
    } finally {
      setResultadosCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (sessaoOk !== true) return;
    void (async () => {
      await carregarInscritos();
      await carregarPalpites();
      await carregarResultadosTeste();
    })();
  }, [sessaoOk, carregarInscritos, carregarPalpites, carregarResultadosTeste]);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const r of lista) {
      next[r.id] = r.link_pagamento ?? "";
    }
    setLinkDrafts(next);
  }, [lista]);

  const totalInscritos = lista.length;

  const arrecadacaoTotal = useMemo(() => {
    return lista.reduce((acc, row) => {
      if (row.status_pagamento === "pago") {
        return acc + parseValor(row.valor_pago);
      }
      return acc;
    }, 0);
  }, [lista]);

  const inscritoPorId = useMemo(
    () => new Map(lista.map((i) => [i.id, i])),
    [lista],
  );

  const rotuloPorJogoId = useMemo(() => {
    const m = new Map<string, string>();
    for (const j of copa2026JogosResolvidos()) {
      m.set(j.id, `${j.mandante.nome} × ${j.visitante.nome}`);
    }
    return m;
  }, []);

  const gruposJogosBolao = useMemo(() => copa2026JogosPorGrupo(), []);

  const mapaResultadosTeste = useMemo(() => {
    const m = new Map<string, { casa: number; fora: number }>();
    for (const r of resultadosTeste) {
      m.set(r.jogo_id, { casa: r.placar_casa_real, fora: r.placar_fora_real });
    }
    return m;
  }, [resultadosTeste]);

  const palpiteMaisRecentePorChave = useMemo(() => {
    const m = new Map<string, PalpiteBolaoRow>();
    for (const p of palpites) {
      const key = `${p.inscricao_id}::${p.jogo_id}`;
      const cur = m.get(key);
      if (!cur) {
        m.set(key, p);
        continue;
      }
      const tp = p.created_at ? Date.parse(p.created_at) : 0;
      const tc = cur.created_at ? Date.parse(cur.created_at) : 0;
      if (tp >= tc) m.set(key, p);
    }
    return m;
  }, [palpites]);

  const rankingModoTeste = useMemo(() => {
    type Linha = {
      inscricaoId: string;
      nome: string;
      email: string;
      pontos: number;
      jogosComResultado: number;
    };
    const acc = new Map<string, Linha>();
    for (const p of Array.from(palpiteMaisRecentePorChave.values())) {
      const real = mapaResultadosTeste.get(p.jogo_id);
      if (!real) continue;
      const pts = pontuacaoPalpiteContraResultado(
        real.casa,
        real.fora,
        p.placar_casa,
        p.placar_fora,
      );
      const ins = inscritoPorId.get(p.inscricao_id);
      const nome =
        p.inscricao_nome ?? (ins?.nome?.trim() ? ins.nome : null) ?? "—";
      const email =
        p.inscricao_email ?? (ins?.email?.trim() ? ins.email : null) ?? "—";
      const cur =
        acc.get(p.inscricao_id) ?? {
          inscricaoId: p.inscricao_id,
          nome,
          email,
          pontos: 0,
          jogosComResultado: 0,
        };
      cur.pontos += pts;
      cur.jogosComResultado += 1;
      acc.set(p.inscricao_id, cur);
    }
    return Array.from(acc.values()).sort((a, b) =>
      b.pontos !== a.pontos
        ? b.pontos - a.pontos
        : a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" }),
    );
  }, [palpiteMaisRecentePorChave, mapaResultadosTeste, inscritoPorId]);

  async function salvarResultadoTesteParaJogo(jogoId: string) {
    setErro("");
    const d = draftsResultado[jogoId] ?? { casa: "", fora: "" };
    const c = parseInt(String(d.casa).replace(/\D/g, ""), 10);
    const f = parseInt(String(d.fora).replace(/\D/g, ""), 10);
    if (!Number.isFinite(c) || !Number.isFinite(f)) {
      setErro(
        "Informe placar da casa e do visitante (0–99) antes de salvar o resultado.",
      );
      return;
    }
    setSalvandoResultadoJogoId(jogoId);
    try {
      const res = await salvarResultadoTesteBolao({
        jogoId,
        placarCasaReal: c,
        placarForaReal: f,
      });
      if (!res.ok) {
        setErro(res.error);
        return;
      }
      await carregarResultadosTeste();
      await carregarPalpites();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setErro(msg);
    } finally {
      setSalvandoResultadoJogoId(null);
    }
  }

  function tentarLogin() {
    setLoginErro("");
    if (senhaLogin.trim() !== ADMIN_PASSWORD_FIXA) {
      setLoginErro("Senha incorreta");
      return;
    }
    try {
      localStorage.setItem(STORAGE_ADMIN_SESSION, "1");
    } catch {
      setLoginErro("Não foi possível salvar a sessão neste navegador.");
      return;
    }
    setSenhaLogin("");
    setSessaoOk(true);
  }

  function sair() {
    try {
      localStorage.removeItem(STORAGE_ADMIN_SESSION);
    } catch {
      /* ignore */
    }
    setSessaoOk(false);
    setLista([]);
    setPalpites([]);
    setPalpitesErro("");
    setResultadosTeste([]);
    setResultadosErro("");
    setDraftsResultado({});
    setErro("");
  }

  async function marcarComoPago(id: string) {
    setErro("");
    setAtualizandoId(id);
    try {
      const url = `${SUPABASE_URL}/rest/v1/inscricoes_bolao?id=eq.${encodeURIComponent(id)}`;
      const resposta = await fetch(url, {
        method: "PATCH",
        headers: {
          ...HEADERS_REST,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status_pagamento: "pago" }),
      });

      const texto = await resposta.text();
      if (!resposta.ok) {
        setErro(texto || `Erro HTTP ${resposta.status}`);
        return;
      }

      await carregarInscritos();
      await carregarPalpites();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setErro(msg);
    } finally {
      setAtualizandoId(null);
    }
  }

  async function salvarLinkPagamento(id: string) {
    setErro("");
    setSalvandoLinkId(id);
    const valor = (linkDrafts[id] ?? "").trim();
    try {
      const url = `${SUPABASE_URL}/rest/v1/inscricoes_bolao?id=eq.${encodeURIComponent(id)}`;
      const resposta = await fetch(url, {
        method: "PATCH",
        headers: {
          ...HEADERS_REST,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          link_pagamento: valor.length > 0 ? valor : null,
        }),
      });

      const texto = await resposta.text();
      if (!resposta.ok) {
        setErro(texto || `Erro HTTP ${resposta.status}`);
        return;
      }

      await carregarInscritos();
      await carregarPalpites();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setErro(msg);
    } finally {
      setSalvandoLinkId(null);
    }
  }

  async function copiarLink(id: string, linkSalvo: string | null) {
    const fallback = (linkDrafts[id] ?? "").trim();
    const texto = (linkSalvo ?? "").trim() || fallback;
    if (!texto) {
      setErro("Não há link para copiar. Cole e salve antes.");
      return;
    }
    try {
      setErro("");
      await navigator.clipboard.writeText(texto);
      setCopiouId(id);
      window.setTimeout(() => setCopiouId(null), 2000);
    } catch {
      setErro("Não foi possível copiar. Copie manualmente do campo.");
    }
  }

  if (sessaoOk === null) {
    return (
      <ShellBg>
        <main className="relative flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-zinc-500">Carregando…</p>
        </main>
      </ShellBg>
    );
  }

  if (!sessaoOk) {
    return (
      <ShellBg>
        <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
            Admin · BarbosaTips
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white">
            Acesso ao{" "}
            <span className="bg-gradient-to-r from-[#F7E7B5] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
              painel do bolão
            </span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Digite a senha de administrador para continuar.
          </p>

          <div className="mt-8 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-6 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)]">
            <label
              htmlFor="admin-senha"
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
            >
              Senha
            </label>
            <input
              id="admin-senha"
              type="password"
              autoComplete="current-password"
              value={senhaLogin}
              onChange={(e) => setSenhaLogin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") tentarLogin();
              }}
              className="mb-4 w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)]"
              placeholder="Senha administrativa"
            />
            <button
              type="button"
              onClick={tentarLogin}
              className="w-full rounded-xl bg-gradient-to-r from-[#e8c96b] via-[#d4af37] to-[#b8922b] py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-black shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition hover:brightness-105"
            >
              Entrar
            </button>
            {loginErro ? (
              <p className="mt-4 rounded-lg border border-red-500/35 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {loginErro}
              </p>
            ) : null}
          </div>
        </main>
      </ShellBg>
    );
  }

  return (
    <ShellBg>
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
          Admin · BarbosaTips
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Painel do{" "}
              <span className="bg-gradient-to-r from-[#F7E7B5] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
                Bolão
              </span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Inscrições, links Mercado Pago (manual) e pagamentos · Copa 2026
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() =>
                void (async () => {
                  await carregarInscritos();
                  await carregarPalpites();
                  await carregarResultadosTeste();
                })()
              }
              disabled={carregando || palpitesCarregando || resultadosCarregando}
              className="rounded-xl border border-[#C9A227]/40 bg-[#1a140c] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#F0D78C] transition hover:bg-[#241c12] disabled:opacity-50"
            >
              {carregando || palpitesCarregando || resultadosCarregando
                ? "Atualizando…"
                : "Atualizar lista"}
            </button>
            <button
              type="button"
              onClick={sair}
              className="rounded-xl border border-zinc-600/80 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-red-500/40 hover:text-red-300"
            >
              Sair
            </button>
          </div>
        </div>

        <section
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:max-w-4xl"
          aria-label="Métricas do bolão"
        >
          {[
            {
              titulo: "Total de inscritos",
              valor: carregando ? "…" : String(totalInscritos),
              subtitulo: "registros retornados pela API",
            },
            {
              titulo: "Arrecadação total",
              valor: carregando ? "…" : moedaBRL(arrecadacaoTotal),
              subtitulo: "somente status “pago”",
            },
          ].map((card) => (
            <article
              key={card.titulo}
              className="rounded-2xl border border-[#3d3420]/80 bg-gradient-to-b from-[#14110c]/95 to-[#0a0908]/95 p-4 shadow-[0_0_0_1px_rgba(212,175,55,.06)_inset] sm:p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a806f]">
                {card.titulo}
              </p>
              <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#F0D78C] tabular-nums sm:text-3xl">
                {card.valor}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{card.subtitulo}</p>
            </article>
          ))}
        </section>

        {erro ? (
          <div className="mt-8 rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <pre className="whitespace-pre-wrap font-sans">{erro}</pre>
          </div>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-[#3d3420]/80 px-4 py-4 sm:px-6">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
            <div>
              <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                Inscritos
              </h2>
              <p className="text-xs text-zinc-500">
                Nome, e-mail, status, valor e link de pagamento (Mercado Pago)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#3d3420]/80 bg-black/40">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Valor
                  </th>
                  <th className="min-w-[300px] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Link Mercado Pago
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Pagamento
                  </th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-zinc-500"
                    >
                      Carregando inscritos…
                    </td>
                  </tr>
                ) : lista.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-zinc-500"
                    >
                      <p>Nenhum inscrito encontrado.</p>
                      {!erro ? (
                        <p className="mt-3 max-w-md text-xs leading-relaxed text-zinc-600">
                          Se existem linhas no Supabase e a lista veio vazia,
                          confira a política RLS da tabela{" "}
                          <code className="text-[#C9A227]">inscricoes_bolao</code>{" "}
                          para permitir SELECT com a chave usada nesta página.
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  lista.map((row, idx) => {
                    const valorNum = parseValor(row.valor_pago);
                    const ehPago = row.status_pagamento === "pago";
                    const alternada = idx % 2 === 0;
                    const linkSalvo = row.link_pagamento?.trim() ?? "";
                    const draft = linkDrafts[row.id] ?? "";

                    return (
                      <tr
                        key={row.id}
                        className={
                          alternada
                            ? "border-b border-[#1f1a14]/90 bg-[#080706]/60"
                            : "border-b border-[#1f1a14]/90 bg-transparent"
                        }
                      >
                        <td className="max-w-[160px] truncate px-4 py-3.5 align-top font-medium text-zinc-100 sm:max-w-none sm:px-6">
                          {row.nome ?? "—"}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-3.5 align-top text-zinc-400 sm:max-w-xs sm:px-6">
                          {row.email ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-top sm:px-6">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                              ehPago
                                ? "border-emerald-500/40 bg-emerald-950/35 text-emerald-300"
                                : "border-[#C9A227]/40 bg-[#1a140c] text-[#F0D78C]"
                            }`}
                          >
                            {row.status_pagamento ?? "—"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-top tabular-nums text-[#F0D78C] sm:px-6">
                          {moedaBRL(valorNum)}
                        </td>
                        <td className="min-w-[280px] max-w-[380px] px-4 py-3 align-top sm:px-6">
                          <div className="flex flex-col gap-2">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Salvo no Supabase
                              </p>
                              {linkSalvo ? (
                                <a
                                  href={linkSalvo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 block break-all text-xs leading-snug text-[#F0D78C] underline decoration-[#C9A227]/50 underline-offset-2 hover:text-[#F7E7B5]"
                                  title={linkSalvo}
                                >
                                  {encurtarUrl(linkSalvo, 56)}
                                </a>
                              ) : (
                                <p className="mt-1 text-xs text-zinc-600">
                                  Nenhum link salvo ainda.
                                </p>
                              )}
                            </div>
                            <label className="sr-only" htmlFor={`link-${row.id}`}>
                              Colar link Mercado Pago para {row.nome}
                            </label>
                            <input
                              id={`link-${row.id}`}
                              type="url"
                              inputMode="url"
                              autoComplete="off"
                              placeholder="Cole o link Mercado Pago aqui"
                              value={draft}
                              onChange={(e) =>
                                setLinkDrafts((p) => ({
                                  ...p,
                                  [row.id]: e.target.value,
                                }))
                              }
                              disabled={
                                salvandoLinkId === row.id || carregando
                              }
                              className="w-full rounded-lg border border-zinc-700/90 bg-black/50 px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-[#C9A227]/60"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={
                                  salvandoLinkId === row.id || carregando
                                }
                                onClick={() => void salvarLinkPagamento(row.id)}
                                className="rounded-lg border border-[#C9A227]/45 bg-[#2a2318] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#F0D78C] transition hover:bg-[#352a1c] disabled:opacity-40"
                              >
                                {salvandoLinkId === row.id
                                  ? "Salvando…"
                                  : "Salvar link"}
                              </button>
                              <button
                                type="button"
                                disabled={
                                  !linkSalvo &&
                                  !(linkDrafts[row.id] ?? "").trim()
                                }
                                onClick={() =>
                                  void copiarLink(row.id, row.link_pagamento)
                                }
                                className="rounded-lg border border-zinc-600/80 bg-zinc-900/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-200 transition hover:border-[#C9A227]/40 hover:text-[#F0D78C] disabled:cursor-not-allowed disabled:opacity-35"
                              >
                                {copiouId === row.id ? "Copiado!" : "Copiar link"}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top text-right sm:px-6">
                          <button
                            type="button"
                            disabled={
                              ehPago ||
                              atualizandoId === row.id ||
                              carregando
                            }
                            onClick={() => void marcarComoPago(row.id)}
                            className="rounded-lg border border-[#C9A227]/50 bg-gradient-to-r from-[#e8c96b]/90 via-[#d4af37]/90 to-[#b8922b]/90 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-black shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {atualizandoId === row.id
                              ? "Salvando…"
                              : "Marcar como pago"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-[#3d3420]/80 px-4 py-4 sm:px-6">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
            <div>
              <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                Palpites Recebidos
              </h2>
              <p className="text-xs text-zinc-500">
                Dados de <code className="text-[#C9A227]/90">palpites_bolao</code>{" "}
                ligados a <code className="text-[#C9A227]/90">inscricoes_bolao</code>{" "}
                (ordenado por envio, mais recente primeiro)
              </p>
            </div>
          </div>

          {palpitesErro ? (
            <div className="border-b border-[#3d3420]/80 px-4 py-3 text-sm text-amber-200/90 sm:px-6">
              <pre className="whitespace-pre-wrap font-sans">{palpitesErro}</pre>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#3d3420]/80 bg-black/40">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Jogo
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Placar do palpite
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Pts (teste)
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Data/hora do envio
                  </th>
                </tr>
              </thead>
              <tbody>
                {palpitesCarregando ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      Carregando palpites…
                    </td>
                  </tr>
                ) : palpites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      Nenhum palpite salvo ainda.
                    </td>
                  </tr>
                ) : (
                  palpites.map((p, idx) => {
                    const ins = inscritoPorId.get(p.inscricao_id);
                    const nome =
                      p.inscricao_nome ?? (ins?.nome?.trim() ? ins.nome : null) ?? "—";
                    const email =
                      p.inscricao_email ??
                      (ins?.email?.trim() ? ins.email : null) ??
                      "—";
                    const alternada = idx % 2 === 0;
                    const placarTxt = `${p.placar_casa ?? "—"} × ${p.placar_fora ?? "—"}`;
                    const real = mapaResultadosTeste.get(p.jogo_id);
                    const ptsTeste =
                      real !== undefined
                        ? pontuacaoPalpiteContraResultado(
                            real.casa,
                            real.fora,
                            p.placar_casa,
                            p.placar_fora,
                          )
                        : null;
                    return (
                      <tr
                        key={p.id}
                        className={
                          alternada
                            ? "border-b border-[#1f1a14]/90 bg-[#080706]/60"
                            : "border-b border-[#1f1a14]/90 bg-transparent"
                        }
                      >
                        <td className="max-w-[140px] truncate px-4 py-3 align-top font-medium text-zinc-100 sm:px-6">
                          {nome}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 align-top text-zinc-400 sm:px-6">
                          {email}
                        </td>
                        <td className="max-w-[280px] px-4 py-3 align-top text-xs text-zinc-300 sm:px-6">
                          <span className="font-mono text-[10px] text-zinc-600">{p.jogo_id}</span>
                          <span className="mt-1 block text-[13px] leading-snug text-zinc-200">
                            {rotuloPorJogoId.get(p.jogo_id) ?? p.jogo_id}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top font-mono tabular-nums text-[#F0D78C] sm:px-6">
                          {placarTxt}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top text-center sm:px-6">
                          {ptsTeste === null ? (
                            <span className="text-zinc-600">—</span>
                          ) : (
                            <span className="font-mono font-bold text-[#E8D48B]">
                              {ptsTeste}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-zinc-500 sm:px-6">
                          {formatarDataHoraPalpite(p.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm">
          <div className="flex flex-col gap-2 border-b border-[#3d3420]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
              <div>
                <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                  Resultados dos Jogos
                </h2>
                <p className="text-xs text-zinc-500">
                  Modo de teste: placares reais fictícios em{" "}
                  <code className="text-[#C9A227]/90">bolao_resultados_teste</code>{" "}
                  (não altera palpites dos participantes). Use para validar o ranking
                  antes dos jogos oficiais.
                </p>
              </div>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a806f]">
              3 pts = placar exato · 1 pt = vencedor ou empate · 0 = erro
            </p>
          </div>

          {resultadosErro ? (
            <div className="border-b border-[#3d3420]/80 px-4 py-3 text-sm text-amber-200/90 sm:px-6">
              <pre className="whitespace-pre-wrap font-sans">{resultadosErro}</pre>
            </div>
          ) : null}

          <div className="max-h-[min(70vh,720px)] overflow-y-auto px-2 py-4 sm:px-4">
            {resultadosCarregando ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                Carregando resultados de teste…
              </p>
            ) : (
              <div className="flex flex-col gap-6">
                {gruposJogosBolao.map(({ grupo, jogos }) => (
                  <div key={grupo}>
                    <div className="mb-2 flex items-center gap-2 px-2">
                      <div className="h-px min-w-[8px] flex-1 bg-[#C9A227]/40" />
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-[#E8D48B]">
                        Grupo {grupo}
                      </span>
                      <div className="h-px min-w-[8px] flex-1 bg-[#C9A227]/40" />
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-[#1f1a14]/90 bg-black/30">
                      <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-[#3d3420]/80 bg-black/50">
                            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a806f] sm:px-4">
                              Rod.
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a806f] sm:px-4">
                              Partida
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a806f] sm:px-4">
                              placar_casa_real
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a806f] sm:px-4">
                              placar_fora_real
                            </th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a806f] sm:px-4">
                              Ação
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {jogos.map((jogo, idx) => {
                            const draft = draftsResultado[jogo.id] ?? {
                              casa: "",
                              fora: "",
                            };
                            const salvo = mapaResultadosTeste.get(jogo.id);
                            const alternada = idx % 2 === 0;
                            return (
                              <tr
                                key={jogo.id}
                                className={
                                  alternada
                                    ? "border-b border-[#1f1a14]/80 bg-[#080706]/50"
                                    : "border-b border-[#1f1a14]/80 bg-transparent"
                                }
                              >
                                <td className="whitespace-nowrap px-3 py-2 text-zinc-500 sm:px-4">
                                  {jogo.rodada}
                                </td>
                                <td className="max-w-[220px] px-3 py-2 sm:max-w-xs sm:px-4">
                                  <span className="block font-mono text-[9px] text-zinc-600">
                                    {jogo.id}
                                  </span>
                                  <span className="mt-0.5 block leading-snug text-zinc-200">
                                    {jogo.mandante.nome} × {jogo.visitante.nome}
                                  </span>
                                  {salvo !== undefined ? (
                                    <span className="mt-1 block text-[10px] text-emerald-400/90">
                                      Salvo: {salvo.casa} × {salvo.fora}
                                    </span>
                                  ) : null}
                                </td>
                                <td className="px-3 py-2 sm:px-4">
                                  <label className="sr-only" htmlFor={`rc-${jogo.id}`}>
                                    placar_casa_real {jogo.id}
                                  </label>
                                  <input
                                    id={`rc-${jogo.id}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={draft.casa}
                                    onChange={(e) =>
                                      setDraftsResultado((prev) => ({
                                        ...prev,
                                        [jogo.id]: {
                                          ...draft,
                                          casa: e.target.value.replace(/\D/g, "").slice(0, 2),
                                        },
                                      }))
                                    }
                                    className="w-12 rounded border border-zinc-700/90 bg-black/60 px-2 py-1.5 text-center font-mono text-[#F0D78C] outline-none focus:border-[#C9A227]/60 sm:w-14"
                                    placeholder="—"
                                  />
                                </td>
                                <td className="px-3 py-2 sm:px-4">
                                  <label className="sr-only" htmlFor={`rf-${jogo.id}`}>
                                    placar_fora_real {jogo.id}
                                  </label>
                                  <input
                                    id={`rf-${jogo.id}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={draft.fora}
                                    onChange={(e) =>
                                      setDraftsResultado((prev) => ({
                                        ...prev,
                                        [jogo.id]: {
                                          ...draft,
                                          fora: e.target.value.replace(/\D/g, "").slice(0, 2),
                                        },
                                      }))
                                    }
                                    className="w-12 rounded border border-zinc-700/90 bg-black/60 px-2 py-1.5 text-center font-mono text-[#F0D78C] outline-none focus:border-[#C9A227]/60 sm:w-14"
                                    placeholder="—"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right sm:px-4">
                                  <button
                                    type="button"
                                    disabled={salvandoResultadoJogoId === jogo.id}
                                    onClick={() =>
                                      void salvarResultadoTesteParaJogo(jogo.id)
                                    }
                                    className="rounded-lg border border-[#C9A227]/50 bg-gradient-to-r from-[#e8c96b]/90 via-[#d4af37]/90 to-[#b8922b]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-black shadow-sm transition hover:brightness-105 disabled:opacity-40 sm:text-[11px]"
                                  >
                                    {salvandoResultadoJogoId === jogo.id
                                      ? "Salvando…"
                                      : "Salvar resultado"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-[#3d3420]/80 px-4 py-4 sm:px-6">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
            <div>
              <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                Ranking (modo teste)
              </h2>
              <p className="text-xs text-zinc-500">
                Soma automática dos pontos por inscrição, usando apenas jogos com
                resultado de teste salvo e palpite completo (0–99 em ambos os lados).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#3d3420]/80 bg-black/40">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    #
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Jogos c/ resultado
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a806f] sm:px-6">
                    Total pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankingModoTeste.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                      Nenhum ponto ainda — cadastre resultados de teste e palpites
                      completos para ver o ranking.
                    </td>
                  </tr>
                ) : (
                  rankingModoTeste.map((row, idx) => {
                    const alternada = idx % 2 === 0;
                    return (
                      <tr
                        key={row.inscricaoId}
                        className={
                          alternada
                            ? "border-b border-[#1f1a14]/90 bg-[#080706]/60"
                            : "border-b border-[#1f1a14]/90 bg-transparent"
                        }
                      >
                        <td className="px-4 py-3 font-mono text-[#C9A227] sm:px-6">
                          {idx + 1}
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-3 font-medium text-zinc-100 sm:px-6">
                          {row.nome}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-zinc-400 sm:px-6">
                          {row.email}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-400 sm:px-6">
                          {row.jogosComResultado}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-lg font-bold text-[#F0D78C] sm:px-6">
                          {row.pontos}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </ShellBg>
  );
}
