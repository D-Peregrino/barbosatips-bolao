import Link from "next/link";
import { siteConfig } from "@/config/site";
import { listarAnalisesPublicadas } from "@/lib/analises/queries";
import { oddParaNumero } from "@/lib/analises/types";

export const metadata = {
  title: `Análises · ${siteConfig.shortTitle}`,
  description:
    "Análises esportivas com leitura de odds, confiança e contexto de campeonato.",
};

export const revalidate = siteConfig.revalidate.analises;

export default async function AnalisesPage() {
  const lista = await listarAnalisesPublicadas();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black pb-16 pt-6 text-zinc-100">
      <div className="container-site">
        <header className="mb-10 max-w-2xl border-b border-[#3d3420]/80 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
            Editorial
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Análises <span className="text-gold">BarbosaTips</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Leituras de jogos com odd sugerida, nível de confiança e resumo — conteúdo
            para quem acompanha o mercado com método.
          </p>
        </header>

        {lista.length === 0 ? (
          <div className="rounded-2xl border border-[#3d3420]/60 bg-[#0c0b09]/80 px-6 py-12 text-center">
            <p className="text-zinc-400">
              Em breve as primeiras análises publicadas aparecem aqui. Publique
              em{" "}
              <Link
                href="/admin-editorial/nova"
                className="font-semibold text-gold underline-offset-2 hover:underline"
              >
                /admin-editorial/nova
              </Link>{" "}
              com estado &quot;Publicado&quot; (migração{" "}
              <code className="text-gold/90">008_analises</code> no Supabase).
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-semibold text-gold underline-offset-4 hover:underline"
            >
              Voltar ao início
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {lista.map((a) => {
              const oddFmt = oddParaNumero(a.odd).toFixed(2);
              return (
                <li key={a.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2a2418] bg-gradient-to-b from-[#12100c] to-[#0a0908] shadow-[0_24px_60px_-28px_rgba(0,0,0,.85)] transition hover:border-[#C9A227]/40">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                      {a.imagem_capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.imagem_capa}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-black text-4xl opacity-40">
                          ⚽
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2 pt-8">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gold/90">
                          {a.campeonato || "Campeonato"}
                        </p>
                        <p className="truncate text-sm font-bold text-white">
                          {a.time_casa} × {a.time_fora}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                      <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug text-white">
                        {a.titulo}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
                        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                          Odd {oddFmt}
                        </span>
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                          Confiança {a.confianca}%
                        </span>
                      </div>
                      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
                        {a.resumo || "Sem resumo."}
                      </p>
                      <Link
                        href={`/analise/${a.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-2.5 text-sm font-bold text-black transition hover:brightness-110"
                      >
                        Ver análise
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
