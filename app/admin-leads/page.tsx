import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { listLeadsForAdmin } from "@/lib/leads/actions";

export const dynamic = "force-dynamic";

const base = siteConfig.url.replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Admin leads | ${siteConfig.shortTitle}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${base}/admin-leads` },
  };
}

export default async function AdminLeadsPage() {
  const leads = await listLeadsForAdmin();

  return (
    <div className="min-h-screen bg-[#050504] pb-16 pt-8 text-zinc-100">
      <div className="container-site max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
              Admin · Leads
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">Newsletter &amp; capturas</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Ambiente confiável — mesma política que /admin-picks. Requer migração{" "}
              <code className="rounded bg-zinc-900 px-1 text-zinc-400">016_leads</code> e service role.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin-picks"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold/40 hover:text-white"
            >
              ← Admin picks
            </Link>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold/40 hover:text-white"
            >
              Página pública →
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-black/40 text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Nome</th>
                <th className="px-3 py-3">Desporto</th>
                <th className="px-3 py-3">Picks</th>
                <th className="px-3 py-3">Greens</th>
                <th className="px-3 py-3">Premium</th>
                <th className="px-3 py-3">Live</th>
                <th className="px-3 py-3">Origem</th>
                <th className="px-3 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">
                    Sem leads ou Supabase indisponível. Aplica a migração e confirma{" "}
                    <code className="text-zinc-400">SUPABASE_SERVICE_ROLE_KEY</code>.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-900/30">
                    <td className="px-3 py-2.5 font-mono text-xs text-gold-200/90">{l.email}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{l.name || "—"}</td>
                    <td className="px-3 py-2.5 text-zinc-300">{l.favorite_sport}</td>
                    <td className="px-3 py-2.5">{l.want_picks ? "✓" : "—"}</td>
                    <td className="px-3 py-2.5">{l.want_greens ? "✓" : "—"}</td>
                    <td className="px-3 py-2.5">{l.want_premium_analises ? "✓" : "—"}</td>
                    <td className="px-3 py-2.5">{l.want_live_alerts ? "✓" : "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-500">{l.source}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-zinc-500">
                      {new Date(l.created_at).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
