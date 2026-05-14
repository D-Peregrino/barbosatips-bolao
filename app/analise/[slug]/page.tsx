import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/server";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import { AnaliseCapaMedia } from "@/components/analises/portal/AnaliseCapaMedia";
import { oddParaNumero, type AnaliseRow, type AnaliseStatus } from "@/lib/analises/types";
import { conteudoAnaliseParaHtmlPublico } from "@/lib/analises/render-conteudo-analise";

type Props = { params: { slug: string } };

const COLUNAS =
  "id,slug,titulo,categoria,tags,campeonato,time_casa,time_fora,odd,confianca,resumo,conteudo,imagem_capa,status,created_at" as const;

function paraStatus(raw: unknown): AnaliseStatus {
  return String(raw ?? "").toLowerCase().trim() === "publicado"
    ? "publicado"
    : "rascunho";
}

function mapRow(r: Record<string, unknown>): AnaliseRow {
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    titulo: String(r.titulo ?? ""),
    categoria: String(r.categoria ?? ""),
    tags: String(r.tags ?? ""),
    campeonato: String(r.campeonato ?? ""),
    time_casa: String(r.time_casa ?? ""),
    time_fora: String(r.time_fora ?? ""),
    odd: r.odd as string | number,
    confianca: Number(r.confianca ?? 0),
    resumo: String(r.resumo ?? ""),
    conteudo: String(r.conteudo ?? ""),
    imagem_capa: String(r.imagem_capa ?? ""),
    status: paraStatus(r.status),
    created_at: String(r.created_at ?? ""),
  };
}

/**
 * Busca na tabela `analises` com slug normalizado (uma query por pedido, partilhada com metadata).
 */
const buscarAnaliseNaTabela = cache(async (paramsSlug: string) => {
  if (shouldSkipLiveSupabase()) {
    const err = { message: "Supabase indisponível", code: "skip" };
    return { data: null as AnaliseRow | null, error: err as unknown };
  }

  const slug = decodeURIComponent(String(paramsSlug ?? ""))
    .trim()
    .toLowerCase();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("analises")
    .select(COLUNAS)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  return { data: mapRow(data as Record<string, unknown>), error: null };
});

export async function generateMetadata({ params }: Props) {
  const { data } = await buscarAnaliseNaTabela(params.slug);
  if (!data) {
    return { title: "Análise · BarbosaTips" };
  }
  return {
    title: `${data.titulo} · Análises · BarbosaTips`,
    description: data.resumo || siteConfig.description,
  };
}

export const revalidate = siteConfig.revalidate.analises;

export default async function AnaliseSlugPage({ params }: Props) {
  const { data } = await buscarAnaliseNaTabela(params.slug);

  if (!data) {
    notFound();
  }

  const a = data;
  const oddFmt = oddParaNumero(a.odd).toFixed(2);
  const tg = siteConfig.social.telegram;
  const corpoHtml = conteudoAnaliseParaHtmlPublico(a.conteudo);

  return (
    <article className="min-h-[calc(100vh-64px)] bg-black pb-20 pt-6 text-zinc-100">
      <div className="container-site max-w-3xl">
        <nav className="mb-6 text-sm text-zinc-500">
          <Link
            href="/analises"
            className="font-medium text-gold/90 underline-offset-2 hover:underline"
          >
            ← Análises
          </Link>
        </nav>

        {a.status === "rascunho" ? (
          <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
            Rascunho — visível apenas em modo de teste (slug sem filtro de
            publicação).
          </p>
        ) : null}

        <header className="mb-8">
          <div
            className="mb-8 overflow-hidden rounded-2xl border border-[#3d3420]/80 bg-[#080706] shadow-[0_24px_60px_-32px_rgba(0,0,0,.85)]"
            aria-label="Capa da análise"
          >
            <AnaliseCapaMedia
              analise={a}
              aspectClass="aspect-[2/1] min-h-[160px] sm:aspect-[21/9] sm:min-h-[200px]"
            />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            {a.campeonato || "Campeonato"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            {a.titulo}
          </h1>
          <p className="mt-3 text-lg font-semibold text-zinc-200">
            {a.time_casa}{" "}
            <span className="text-zinc-600" aria-hidden>
              ×
            </span>{" "}
            {a.time_fora}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-300">
              Odd {oddFmt}
            </span>
            <span className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-200">
              Confiança {a.confianca}%
            </span>
          </div>
        </header>

        <div className="prose prose-invert prose-headings:font-display max-w-none rounded-2xl border border-[#2a2418] bg-[#0c0b09]/90 p-6 text-base leading-relaxed text-zinc-200 sm:p-8 prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-h1:text-2xl prose-h2:text-xl prose-a:text-[#C9A227] prose-blockquote:border-[#C9A227]/50 prose-blockquote:text-zinc-400 prose-hr:border-zinc-600">
          {corpoHtml ? (
            <div
              className="analise-conteudo-html"
              // eslint-disable-next-line react/no-danger -- HTML sanitizado (XSS mitigado)
              dangerouslySetInnerHTML={{ __html: corpoHtml }}
            />
          ) : (
            <p className="text-zinc-500">Conteúdo em elaboração.</p>
          )}
        </div>

        <aside className="mt-12 rounded-2xl border border-[#C9A227]/35 bg-gradient-to-br from-[#1a1610] to-[#0c0b09] p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-gold">
            Receba mais análises
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Entre no Telegram oficial da BarbosaTips para tips, análises e avisos
            em tempo real.
          </p>
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#229ED9] py-3 text-sm font-bold text-white transition hover:brightness-110 sm:w-auto sm:px-8"
          >
            CTA Telegram
          </a>
        </aside>
      </div>
    </article>
  );
}
