import Link from "next/link";
import type { Metadata } from "next";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { pontuacaoPalpiteContraResultado } from "@/lib/bolao/pontuacao-palpite";
import { COPA2026_JOGOS } from "@/lib/mocks/copa2026-groupstage.mock";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const metadata: Metadata = {
  title: "Ranking · Bolão Copa 2026 | BarbosaTips",
  description:
    "Ranking público do bolão Copa 2026 — transparência: pontos, exatos e palpites válidos.",
};

export const dynamic = "force-dynamic";

type ResultadoOficial = {
  jogo_id: string;
  placar_casa_real: number;
  placar_fora_real: number;
};

type InscritoRow = { id: string; nome: string };
type PalpiteRow = {
  inscricao_id: string;
  jogo_id: string;
  placar_casa: unknown;
  placar_fora: unknown;
};

/** Mesma base que o admin: no SSR preferimos service role para ler `bolao_resultados_teste` com garantia. */
function createRankingSupabaseServer(): SupabaseClient | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!url) return null;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = service || anon;
  if (!key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const JOGO_ID_CANONICO_POR_LOWER = new Map(
  COPA2026_JOGOS.map((j) => [j.id.toLowerCase(), j.id] as const),
);

function canonicalizarJogoId(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  return JOGO_ID_CANONICO_POR_LOWER.get(t.toLowerCase()) ?? t;
}

/** Placar oficial vindo do PostgREST (número, string, float). */
function parsePlacarOficial(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (!Number.isFinite(n)) return null;
  const r = Math.trunc(n);
  if (r < 0 || r > 99) return null;
  return r;
}

function linhaTemPlacaresOficiais(row: Record<string, unknown>): boolean {
  const c = parsePlacarOficial(row.placar_casa_real);
  const f = parsePlacarOficial(row.placar_fora_real);
  return c !== null && f !== null;
}

function normalizarResultadosOficiais(
  raw: unknown[] | null | undefined,
): ResultadoOficial[] {
  const out: ResultadoOficial[] = [];
  for (const row of raw ?? []) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const jogoIdRaw = String(r.jogo_id ?? "").trim();
    if (!jogoIdRaw) continue;
    const jogoId = canonicalizarJogoId(jogoIdRaw);
    const casa = parsePlacarOficial(r.placar_casa_real);
    const fora = parsePlacarOficial(r.placar_fora_real);
    if (casa === null || fora === null) continue;
    out.push({
      jogo_id: jogoId,
      placar_casa_real: casa,
      placar_fora_real: fora,
    });
  }
  return out;
}

function temAlgumResultadoOficialNaResposta(
  raw: unknown[] | null | undefined,
): boolean {
  for (const row of raw ?? []) {
    if (!row || typeof row !== "object") continue;
    if (linhaTemPlacaresOficiais(row as Record<string, unknown>)) return true;
  }
  return false;
}

function parsePlacarPalpite(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isInteger(v)) return v;
  const n = parseInt(String(v), 10);
  return Number.isInteger(n) ? n : null;
}

function mapInscrito(row: Record<string, unknown>): InscritoRow | null {
  const id = String(row.id ?? "").trim();
  if (!id) return null;
  const nome = String(row.nome ?? "").trim() || "—";
  return { id, nome };
}

function mapPalpite(row: Record<string, unknown>): PalpiteRow | null {
  const inscricao_id = String(row.inscricao_id ?? "").trim();
  const jogo_id = String(row.jogo_id ?? "").trim();
  if (!inscricao_id || !jogo_id) return null;
  return {
    inscricao_id,
    jogo_id: canonicalizarJogoId(jogo_id),
    placar_casa: row.placar_casa,
    placar_fora: row.placar_fora,
  };
}

type RankingLinha = {
  id: string;
  nome: string;
  pontos: number;
  acertosExatos: number;
  palpitesValidos: number;
  posicao: number;
};

async function carregarRankingBolao(): Promise<
  | { ok: true; temResultadosOficiais: boolean; linhas: RankingLinha[] }
  | { ok: false; erro: string }
> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, erro: "Ranking indisponível no ambiente atual." };
  }

  const sb = createRankingSupabaseServer();
  if (!sb) {
    return {
      ok: false,
      erro: "Configure Supabase (URL e SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    };
  }

  const [insRes, palRes, resRes] = await Promise.all([
    sb
      .from("inscricoes_bolao")
      .select("id,nome")
      .order("created_at", { ascending: false }),
    sb
      .from("palpites_bolao")
      .select("inscricao_id,jogo_id,placar_casa,placar_fora")
      .order("created_at", { ascending: false }),
    sb
      .schema("public")
      .from("bolao_resultados_teste")
      .select("*"),
  ]);

  if (insRes.error) {
    return {
      ok: false,
      erro: insRes.error.message || "Erro ao carregar participantes.",
    };
  }
  if (palRes.error) {
    return { ok: false, erro: palRes.error.message || "Erro ao carregar palpites." };
  }
  if (resRes.error) {
    return { ok: false, erro: resRes.error.message || "Erro ao carregar resultados." };
  }

  const rawResultados = (resRes.data ?? []) as unknown[];
  const temResultadosOficiais =
    temAlgumResultadoOficialNaResposta(rawResultados) ||
    normalizarResultadosOficiais(rawResultados).length > 0;

  const inscritos = ((insRes.data ?? []) as Record<string, unknown>[])
    .map(mapInscrito)
    .filter((x): x is InscritoRow => x != null);

  const palpites = ((palRes.data ?? []) as Record<string, unknown>[])
    .map(mapPalpite)
    .filter((x): x is PalpiteRow => x != null);

  const resultadosOficiais = normalizarResultadosOficiais(rawResultados);
  const resultadoPorJogo = new Map(
    resultadosOficiais.map((r) => [r.jogo_id, r]),
  );

  const palpitesPorInscricao = new Map<string, PalpiteRow[]>();
  for (const p of palpites) {
    const arr = palpitesPorInscricao.get(p.inscricao_id) ?? [];
    arr.push(p);
    palpitesPorInscricao.set(p.inscricao_id, arr);
  }

  const linhasBase = inscritos.map((ins) => {
    const lista = palpitesPorInscricao.get(ins.id) ?? [];
    let pontos = 0;
    let acertosExatos = 0;
    let palpitesValidos = 0;

    for (const p of lista) {
      const pc = parsePlacarPalpite(p.placar_casa);
      const pf = parsePlacarPalpite(p.placar_fora);
      if (pc !== null && pf !== null) {
        palpitesValidos++;
      }

      const ro = resultadoPorJogo.get(p.jogo_id);
      if (!ro) continue;

      const pts = pontuacaoPalpiteContraResultado(
        ro.placar_casa_real,
        ro.placar_fora_real,
        pc,
        pf,
      );
      pontos += pts;
      if (pts === 3) acertosExatos++;
    }

    return {
      id: ins.id,
      nome: ins.nome,
      pontos,
      acertosExatos,
      palpitesValidos,
    };
  });

  linhasBase.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.acertosExatos !== a.acertosExatos) return b.acertosExatos - a.acertosExatos;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const linhas: RankingLinha[] = linhasBase.map((r, i) => ({
    ...r,
    posicao: i + 1,
  }));

  return { ok: true, temResultadosOficiais, linhas };
}

export default async function RankingPage() {
  const data = await carregarRankingBolao();

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#050608] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(212,175,55,.22), transparent 55%)",
        }}
      />

      <div className="relative container-site px-4 py-12 md:py-16">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
          BarbosaTips · Bolão Copa 2026
        </p>
        <h1 className="font-display text-3xl font-bold text-amber-400 md:text-4xl">
          Ranking
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
          Transparência do bolão: 3 pontos placar exato · 1 ponto vencedor ou empate · 0
          erro ou palpite incompleto nos jogos com resultado oficial.
        </p>

        {!data.ok ? (
          <p
            className="mt-8 max-w-xl rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {data.erro}
          </p>
        ) : (
          <>
            {!data.temResultadosOficiais ? (
              <div
                className="mt-10 max-w-2xl rounded-xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-5 shadow-[0_20px_60px_-28px_rgba(212,175,55,.2)]"
                style={{ borderColor: "rgba(245, 158, 11, 0.15)" }}
              >
                <p className="text-sm leading-relaxed text-zinc-300">
                  Ranking será liberado após os primeiros resultados.
                </p>
              </div>
            ) : null}

            {data.linhas.length > 0 ? (
              <section className="mt-10">
                <div
                  className="overflow-x-auto rounded-xl border border-[#3d3420]/90 bg-[#0c0b09]/70 shadow-[0_24px_80px_-32px_rgba(212,175,55,.18)]"
                  style={{ borderColor: "rgba(245, 158, 11, 0.12)" }}
                >
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-[#2a2418] bg-[#14120e] text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Posição</th>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3 text-right">Pontos</th>
                        <th className="px-4 py-3 text-right">Exatos</th>
                        <th className="px-4 py-3 text-right">Palpites válidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.linhas.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-[#2a2418]/90 odd:bg-[#0c0b09]/50"
                        >
                          <td className="px-4 py-3 text-zinc-500">{r.posicao}</td>
                          <td className="px-4 py-3 font-medium text-white">{r.nome}</td>
                          <td className="px-4 py-3 text-right font-semibold text-amber-400">
                            {r.pontos}
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-300">
                            {r.acertosExatos}
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-500">
                            {r.palpitesValidos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <p className="mt-10 max-w-xl text-sm text-zinc-500">
                Ainda não há participantes inscritos no bolão.
              </p>
            )}
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/bolao"
            className="inline-flex items-center justify-center rounded-lg border border-[#3d3420] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-300"
          >
            Bolão
          </Link>
          <Link
            href="/tips"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
          >
            Tips do dia
          </Link>
          <Link
            href="/analises"
            className="inline-flex items-center justify-center rounded-lg border border-[#3d3420] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-300"
          >
            Análises
          </Link>
        </div>
      </div>
    </div>
  );
}
