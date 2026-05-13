import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { obterAnalisePublicadaPorSlug } from "@/lib/analises/queries";
import { oddParaNumero } from "@/lib/analises/types";
import { legadoTextoParaHtmlSeguro } from "@/lib/analises/sanitize-html";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const { slug } = params;
  const a = await obterAnalisePublicadaPorSlug(slug);
  if (!a) {
    return { title: "Análise · BarbosaTips" };
  }
  return {
    title: `${a.titulo} · Análises · BarbosaTips`,
    description: a.resumo || siteConfig.description,
  };
}

export const revalidate = siteConfig.revalidate.analises;

export default async function AnaliseSlugPage({ params }: Props) {
  const { slug } = params;
  const a = await obterAnalisePublicadaPorSlug(slug);
  if (!a) notFound();

  const oddFmt = oddParaNumero(a.odd).toFixed(2);
  const tg = siteConfig.social.telegram;
  const corpoHtml = legadoTextoParaHtmlSeguro(a.conteudo);

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

        <header className="mb-8">
          {a.imagem_capa ? (
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#3d3420]/80 bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.imagem_capa}
                alt=""
                className="max-h-[420px] w-full object-cover"
              />
            </div>
          ) : null}

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

        <div className="prose prose-invert prose-headings:font-display max-w-none rounded-2xl border border-[#2a2418] bg-[#0c0b09]/90 p-6 text-base leading-relaxed text-zinc-200 sm:p-8 prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-a:text-[#C9A227] prose-blockquote:border-[#C9A227]/50 prose-blockquote:text-zinc-400 prose-hr:border-zinc-600">
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
