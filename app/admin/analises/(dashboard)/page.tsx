import Link from "next/link";
import { listarTodasAnalisesAdmin } from "@/lib/analises/admin-queries";
import { logoutAdminAnalisesAction } from "@/app/admin/analises/auth-actions";
import { oddParaNumero } from "@/lib/analises/types";

export const metadata = {
  title: "Admin Análises · BarbosaTips",
};

export default async function AdminAnalisesDashboardPage() {
  const rows = await listarTodasAnalisesAdmin();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.22), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-4 border-b border-[#3d3420]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
              BarbosaTips · Editorial
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              Análises
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Listagem de todas as análises (rascunho e publicadas).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/analises/nova"
              className="rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition hover:brightness-110"
            >
              + Nova análise
            </Link>
            <form action={logoutAdminAnalisesAction}>
              <button
                type="submit"
                className="rounded-xl border border-[#5c4d28]/90 bg-[#14120e] px-4 py-2 text-sm font-medium text-[#E8D48B] transition hover:border-[#C9A227]/50"
              >
                Sair
              </button>
            </form>
          </div>
        </header>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#3d3420]/90">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#14120e] text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Odd</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-t border-[#2a2418]/90 px-4 py-8 text-center text-zinc-500"
                  >
                    Nenhuma análise ainda. Crie a primeira com &quot;+ Nova
                    análise&quot; (aplique a migração Supabase{" "}
                    <code className="text-[#C9A227]/80">008_analises</code> se
                    necessário).
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-[#2a2418]/90 odd:bg-[#0c0b09]/50"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {a.titulo}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                      {a.slug}
                    </td>
                    <td className="px-4 py-3">
                      {a.status === "publicado" ? (
                        <span className="text-emerald-400">Publicado</span>
                      ) : (
                        <span className="text-amber-300">Rascunho</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {oddParaNumero(a.odd).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.status === "publicado" ? (
                        <Link
                          href={`/analise/${a.slug}`}
                          className="text-xs font-semibold text-[#C9A227] underline-offset-2 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver no site
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
