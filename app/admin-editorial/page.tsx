import Link from "next/link";
import { listarTodasAnalisesAdmin } from "@/lib/analises/admin-queries";
import { oddParaNumero } from "@/lib/analises/types";

export const metadata = {
  title: "Admin Editorial · BarbosaTips",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function AdminEditorialPage({ searchParams }: Props) {
  const g = searchParams?.gravado;
  const gravado = g === "1" || (Array.isArray(g) && g[0] === "1");
  const u = searchParams?.atualizado;
  const atualizado = u === "1" || (Array.isArray(u) && u[0] === "1");
  const s = searchParams?.slug;
  const slugGravado =
    typeof s === "string" ? s : Array.isArray(s) ? s[0] ?? "" : "";

  const lista = await listarTodasAnalisesAdmin();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        {gravado ? (
          <p className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Análise gravada
            {slugGravado ? (
              <>
                {" "}
                — slug:{" "}
                <code className="text-emerald-200">{slugGravado}</code>.{" "}
                <Link
                  href={`/analise/${encodeURIComponent(slugGravado)}`}
                  className="font-medium text-emerald-200 underline-offset-2 hover:underline"
                >
                  Ver no site
                </Link>{" "}
                (só se estiver publicada).
              </>
            ) : null}
          </p>
        ) : null}

        {atualizado ? (
          <p className="mb-6 rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
            Análise atualizada
            {slugGravado ? (
              <>
                {" "}
                — slug:{" "}
                <code className="text-sky-200">{slugGravado}</code>.{" "}
                <Link
                  href={`/analise/${encodeURIComponent(slugGravado)}`}
                  className="font-medium text-sky-200 underline-offset-2 hover:underline"
                >
                  Ver no site
                </Link>
                .
              </>
            ) : null}
          </p>
        ) : null}

        <h1 className="font-serif text-3xl font-bold text-[#E8D48B]">
          Admin Editorial BarbosaTips
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Formulários simples; grava na tabela{" "}
          <code className="text-zinc-300">analises</code> (service role no
          servidor).
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin-editorial/nova"
            className="inline-flex rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition hover:brightness-110"
          >
            Nova análise
          </Link>
          <Link
            href="/analises"
            className="inline-flex items-center rounded-xl border border-[#5c4d28]/90 px-6 py-3 text-sm font-medium text-[#E8D48B] transition hover:border-[#C9A227]/50"
          >
            Ver análises publicadas
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Todas as análises
          </h2>
          {lista.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhuma análise na base. Crie a primeira com &quot;Nova
              análise&quot;.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#3d3420]/90">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#14120e] text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Odd</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[#2a2418]/90 odd:bg-[#0c0b09]/50"
                    >
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-white">
                        {row.titulo}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        {row.slug}
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "publicado" ? (
                          <span className="text-emerald-400">Publicado</span>
                        ) : (
                          <span className="text-amber-300">Rascunho</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {oddParaNumero(row.odd).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin-editorial/editar/${encodeURIComponent(row.slug)}`}
                          className="text-xs font-semibold text-[#C9A227] underline-offset-2 hover:underline"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
