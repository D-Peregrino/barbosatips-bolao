import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { pontuacaoPalpiteContraResultado } from "@/lib/bolao/pontuacao-palpite";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const metadata: Metadata = {
  title: "Ranking · Bolão Copa 2026 · BarbosaTips",
  description:
    "Ranking público do bolão BarbosaTips — pontos por placar exato e resultado.",
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

function createPublicSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function parsePlacar(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isInteger(v)) return v;
  const n = parseInt(String(v), 10);
  return Number.isInteger(n) ? n : null;
}

function normalizarResultadosOficiais(
  raw: unknown[] | null | undefined,
): ResultadoOficial[] {
  const out: ResultadoOficial[] = [];
  for (const row of raw ?? []) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const jogoId = String(r.jogo_id ?? "").trim();
    if (!jogoId) continue;
    const casa = Number(r.placar_casa_real);
    const fora = Number(r.placar_fora_real);
    if (!Number.isInteger(casa) || !Number.isInteger(fora)) continue;
    if (casa < 0 || casa > 99 || fora < 0 || fora > 99) continue;
    out.push({
      jogo_id: jogoId,
      placar_casa_real: casa,
      placar_fora_real: fora,
    });
  }
  return out;
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
    jogo_id,
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

async function carregarRanking(): Promise<
  | { ok: true; temResultadosOficiais: boolean; linhas: RankingLinha[] }
  | { ok: false; erro: string }
> {
  if (shouldSkipLiveSupabase()) {
    return { ok: false, erro: "Ranking indisponível no ambiente atual." };
  }

  const sb = createPublicSupabase();
  if (!sb) {
    return { ok: false, erro: "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY." };
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
      .select("jogo_id,placar_casa_real,placar_fora_real"),
  ]);

  if (insRes.error) {
    return { ok: false, erro: insRes.error.message || "Erro ao carregar participantes." };
  }
  if (palRes.error) {
    return { ok: false, erro: palRes.error.message || "Erro ao carregar palpites." };
  }
  if (resRes.error) {
    return { ok: false, erro: resRes.error.message || "Erro ao carregar resultados." };
  }

  const inscritos = ((insRes.data ?? []) as Record<string, unknown>[])
    .map(mapInscrito)
    .filter((x): x is InscritoRow => x != null);

  const palpites = ((palRes.data ?? []) as Record<string, unknown>[])
    .map(mapPalpite)
    .filter((x): x is PalpiteRow => x != null);

  const resultadosOficiais = normalizarResultadosOficiais(
    resRes.data as unknown[],
  );
  const temResultadosOficiais = resultadosOficiais.length > 0;
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
      const pc = parsePlacar(p.placar_casa);
      const pf = parsePlacar(p.placar_fora);
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

export default async function BolaoRankingPage() {
  const data = await carregarRanking();

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.25), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
          BarbosaTips · Bolão
        </div>

        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ranking Copa 2026
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          3 pontos placar exato · 1 ponto vencedor ou empate · 0 erro ou palpite
          incompleto nos jogos já com resultado oficial.
        </p>

        {!data.ok ? (
          <p
            className="mt-8 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {data.erro}
          </p>
        ) : !data.temResultadosOficiais ? (
          <p className="mt-10 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 px-5 py-6 text-center text-sm leading-relaxed text-zinc-300 shadow-[0_24px_80px_-32px_rgba(212,175,55,.25)] backdrop-blur-sm">
            Ranking será liberado após os primeiros resultados.
          </p>
        ) : (
          <section className="mt-10">
            <div className="overflow-x-auto rounded-2xl border border-[#3d3420]/90 shadow-[0_24px_80px_-32px_rgba(212,175,55,.2)]">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-[#14120e] text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
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
                        {r.palpitesValidos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <p className="mt-10 text-center">
          <Link
            href="/bolao"
            className="text-sm font-medium text-[#C9A227] underline-offset-4 transition hover:text-[#E8D48B] hover:underline"
          >
            ← Voltar ao bolão
          </Link>
        </p>
      </div>
    </div>
  );
}
