import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { listarQuickPicks } from "@/lib/picks/queries";
import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import { AdminQuickPickForm } from "@/components/admin-picks/AdminQuickPickForm";
import { AdminQuickPickEstadoForm } from "@/components/admin-picks/AdminQuickPickEstadoForm";

export const dynamic = "force-dynamic";

const base = siteConfig.url.replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Admin picks | ${siteConfig.shortTitle}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${base}/admin-picks` },
  };
}

function formatarHorario(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPicksPage() {
  const picks = await listarQuickPicks();

  return (
    <div className="min-h-screen bg-[#050504] pb-16 pt-8 text-zinc-100">
      <div className="container-site max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Admin · Picks rápidas
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">
              Publicar em segundos
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Sem login — use apenas em ambiente confiável (como /admin-editorial).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/operacional"
              className="inline-flex items-center justify-center rounded-xl border border-violet-800/50 bg-violet-950/30 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:border-violet-500/55 hover:text-white"
            >
              Painel operacional
            </Link>
            <Link
              href="/admin-leads"
              className="inline-flex items-center justify-center rounded-xl border border-amber-900/50 bg-amber-950/25 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-600/55 hover:text-white"
            >
              Leads / newsletter
            </Link>
            <Link
              href="/picks"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold/40 hover:text-white"
            >
              Ver /picks →
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl sm:p-8">
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Nova pick
          </h2>
          <AdminQuickPickForm />
          <p className="mt-4 text-xs text-zinc-600">
            Horário do jogo: use o horário de <strong className="text-zinc-400">Brasília (UTC−3)</strong>{" "}
            — o mesmo relógio local se estiver no Brasil.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Últimas picks
          </h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-800 bg-black/30 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-3">Jogo</th>
                  <th className="px-3 py-3">Mercado</th>
                  <th className="px-3 py-3">Odd</th>
                  <th className="px-3 py-3">Conf.</th>
                  <th className="px-3 py-3">Horário</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {picks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-zinc-500">
                      Nenhuma pick na base.
                    </td>
                  </tr>
                ) : (
                  picks.map((p) => (
                    <tr key={p.id} className="bg-zinc-950/40 hover:bg-zinc-900/50">
                      <td className="px-3 py-3 font-medium text-white">
                        <span className="block text-[10px] font-normal text-zinc-500">
                          {rotuloEsporte(p.esporte)}
                          {p.campeonato?.trim() ? ` · ${p.campeonato}` : ""}
                        </span>
                        {p.jogo}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-3 text-zinc-400">
                        {p.mercado}
                      </td>
                      <td className="px-3 py-3 font-mono text-gold">
                        @{p.odd.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">{p.confianca}%</td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-500">
                        {formatarHorario(p.horario_jogo)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            p.status === "ativo"
                              ? "text-emerald-400"
                              : "text-zinc-500"
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <AdminQuickPickEstadoForm
                          pickId={p.id}
                          status={p.status}
                          resultado={p.resultado}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
