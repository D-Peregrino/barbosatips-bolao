import Link from "next/link";
import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { siteConfig } from "@/config/site";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { pontuacaoPalpiteContraResultado } from "@/lib/bolao/pontuacao-palpite";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";

export const metadata: Metadata = {
  title: "Ranking · Bolão Copa 2026 | BarbosaTips",
  description:
    "Ranking público do bolão Copa 2026 — transparência: pontos, exatos e palpites válidos.",
};

export const dynamic = "force-dynamic";

/** Igual `BolaoResultadoOficialRow` / `ResultadoRow` do admin (`AdminBolaoPanel`). */
type ResultadoRow = {
  jogo_id: string;
  placar_casa_real: number;
  placar_fora_real: number;
  status?: string | null;
};

/** Igual `PalpiteBolaoRow` do admin (campos usados no ranking). */
type PalpiteBolaoRow = {
  id: string;
  inscricao_id: string;
  jogo_id: string;
  placar_casa: number | null;
  placar_fora: number | null;
};

type InscritoRow = { id: string; nome: string };

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

/**
 * Cópia de `normalizarResultadoRows` em `AdminBolaoPanel.tsx` — mesma regra para
 * `bolao_resultados_teste` (PostgREST pode devolver números como string).
 */
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

/**
 * Cópia de `mapPalpiteRow` em `AdminBolaoPanel.tsx` (sem embed `inscricoes_bolao`),
 * com `jogo_id` normalizado por `String(id).trim()` conforme regra pública.
 */
function mapPalpiteRowRanking(row: Record<string, unknown>): PalpiteBolaoRow | null {
  const inscricao_id = String(row.inscricao_id ?? "").trim();
  const jogo_id = String(row.jogo_id ?? "").trim();
  if (!inscricao_id || !jogo_id) return null;
  const pc = row.placar_casa;
  const pf = row.placar_fora;
  return {
    id: String(row.id),
    inscricao_id,
    jogo_id,
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
  };
}

function mapInscrito(row: Record<string, unknown>): InscritoRow | null {
  const id = String(row.id ?? "").trim();
  if (!id) return null;
  const nome = String(row.nome ?? "").trim() || "Participante";
  return { id, nome };
}

/**
 * Mesmo cálculo que `rankingRows` + `totalPalpitesPorInscricao` em `AdminBolaoPanel.tsx`:
 * itera `palpites`, cruza `resultadoMap.get(p.jogo_id)` por `jogo_id` exato (trim),
 * usa `pontuacaoPalpiteContraResultado`.
 */
function calcularRankingComoAdmin(
  inscritos: InscritoRow[],
  palpites: PalpiteBolaoRow[],
  resultados: ResultadoRow[],
): { linhas: RankingLinha[]; temResultadosOficiais: boolean } {
  const resultadoMap = new Map(resultados.map((r) => [r.jogo_id, r]));
  const temResultadosOficiais = resultados.length > 0;

  const totalPalpitesPorInscricao = new Map<string, number>();
  for (const p of palpites) {
    totalPalpitesPorInscricao.set(
      p.inscricao_id,
      (totalPalpitesPorInscricao.get(p.inscricao_id) ?? 0) + 1,
    );
  }

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

  const linhasBase = inscritos.map((ins) => {
    const a = acc.get(ins.id);
    return {
      id: ins.id,
      nome: ins.nome,
      pontos: a?.pontos ?? 0,
      acertosExatos: a?.exatos ?? 0,
      palpitesValidos: totalPalpitesPorInscricao.get(ins.id) ?? 0,
    };
  });

  linhasBase.sort((x, y) => {
    if (y.pontos !== x.pontos) return y.pontos - x.pontos;
    if (y.acertosExatos !== x.acertosExatos) return y.acertosExatos - x.acertosExatos;
    return x.nome.localeCompare(y.nome, "pt-BR");
  });

  const linhas: RankingLinha[] = linhasBase.map((r, i) => ({
    ...r,
    posicao: i + 1,
  }));

  return { linhas, temResultadosOficiais };
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
    return {
      ok: false,
      erro: "O ranking não está disponível neste momento. Volta mais tarde.",
    };
  }

  const sb = createRankingSupabaseServer();
  if (!sb) {
    return {
      ok: false,
      erro: "O ranking não está disponível neste momento. Volta mais tarde.",
    };
  }

  const [insRes, palRes, resRes] = await Promise.all([
    sb
      .from("inscricoes_bolao")
      .select("id,nome")
      .order("created_at", { ascending: false }),
    sb
      .from("palpites_bolao")
      .select("id,inscricao_id,jogo_id,placar_casa,placar_fora")
      .order("created_at", { ascending: false }),
    sb
      .schema("public")
      .from("bolao_resultados_teste")
      .select("*"),
  ]);

  if (insRes.error) {
    return {
      ok: false,
      erro: "Não conseguimos mostrar o ranking agora. Tenta novamente dentro de alguns minutos.",
    };
  }
  if (palRes.error) {
    return {
      ok: false,
      erro: "Não conseguimos mostrar o ranking agora. Tenta novamente dentro de alguns minutos.",
    };
  }
  if (resRes.error) {
    return {
      ok: false,
      erro: "Não conseguimos mostrar o ranking agora. Tenta novamente dentro de alguns minutos.",
    };
  }

  const inscritos = ((insRes.data ?? []) as Record<string, unknown>[])
    .map(mapInscrito)
    .filter((x): x is InscritoRow => x != null);

  const palpites = ((palRes.data ?? []) as Record<string, unknown>[])
    .map(mapPalpiteRowRanking)
    .filter((x): x is PalpiteBolaoRow => x != null);

  const resultados = normalizarResultadoRows(resRes.data as unknown[]);

  const { linhas, temResultadosOficiais } = calcularRankingComoAdmin(
    inscritos,
    palpites,
    resultados,
  );

  return { ok: true, temResultadosOficiais, linhas };
}

export default async function RankingPage() {
  const data = await carregarRankingBolao();

  return (
    <div className="commercial-page-bg relative overflow-hidden text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(212,175,55,.22), transparent 55%)",
        }}
      />

      <CommercialPageShell className="relative" mainClassName="py-12 md:py-16">
        <div className="w-full min-w-0 px-0">
          <div className="mb-8 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>

          <div className="commercial-card-elevated mb-10 max-w-3xl border border-amber-500/15 p-6 sm:p-8">
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
          </div>

        {!data.ok ? (
          <PortalEmptyState
            icon={Trophy}
            title="Ranking indisponível"
            description={data.erro}
            primaryHref="/picks"
            primaryLabel="Ver picks"
            secondaryHref="/comunidade"
            secondaryLabel="Entrar na comunidade"
            tertiaryHref={siteConfig.hub.youtubeCanalUrl}
            tertiaryLabel="Assistir no YouTube"
            quaternaryHref="/bolao"
            quaternaryLabel="Participar do bolão"
            className="mt-8 text-left sm:text-center"
          />
        ) : (
          <>
            {!data.temResultadosOficiais ? (
              <div
                className="mt-10 max-w-2xl rounded-xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-5 shadow-[0_20px_60px_-28px_rgba(212,175,55,.2)]"
                style={{ borderColor: "rgba(245, 158, 11, 0.15)" }}
              >
                <p className="text-sm leading-relaxed text-zinc-300">
                  O ranking ordenado por pontos aparece assim que existirem jogos com resultado
                  oficial e palpites válidos. Até lá, podes acompanhar o bolão e as picks no resto
                  do site.
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
              <PortalEmptyState
                icon={Trophy}
                title="Ainda não há participantes no ranking"
                description="Quando as primeiras inscrições estiverem activas, os nomes aparecem aqui. Garante a tua vaga no bolão e segue a comunidade para avisos."
                primaryHref="/bolao"
                primaryLabel="Participar do bolão"
                secondaryHref="/comunidade"
                secondaryLabel="Entrar na comunidade"
                tertiaryHref={siteConfig.hub.youtubeCanalUrl}
                tertiaryLabel="Assistir no YouTube"
                quaternaryHref="/picks"
                quaternaryLabel="Ver picks"
                className="mt-10 text-left sm:text-center"
              />
            )}
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/bolao"
            className="inline-flex items-center justify-center rounded-lg border border-[#3d3420] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-300"
          >
            Participar do bolão
          </Link>
          <Link
            href="/picks"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
          >
            Ver picks
          </Link>
          <Link
            href="/comunidade"
            className="inline-flex items-center justify-center rounded-lg border border-[#3d3420] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-300"
          >
            Entrar na comunidade
          </Link>
        </div>

          <div className="mt-10 lg:hidden">
            <SponsorSlot slot="mobileStrip" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
