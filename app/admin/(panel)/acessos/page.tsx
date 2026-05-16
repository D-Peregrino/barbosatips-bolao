import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AdminAccessGrantForm } from "@/components/admin/access/AdminAccessGrantForm";
import { revokeAccessAction } from "@/app/admin/(panel)/acessos/actions";
import type { EntitlementId } from "@/lib/access/entitlement-types";
import { listUserEntitlements } from "@/lib/access/entitlements";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export const metadata = {
  title: "Acessos Comerciais · BarbosaTips",
};

export const dynamic = "force-dynamic";

const entitlementLabels: Record<EntitlementId, string> = {
  vip_premium: "VIP Premium",
  bolao_copa: "Bolão Copa",
  discord_ouvinte: "Discord Ouvinte",
  bot_barbosa: "Bot do Barbosa",
  discord_voz: "Discord com Voz",
};

function formatDate(value: string | null): string {
  if (!value) return "Sem expiração";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminAcessosPage() {
  const gate = await requireAdminActor();
  if (!gate.ok) {
    redirect("/admin/login?redirect=/admin/acessos");
  }

  const rows = await listUserEntitlements();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
            <KeyRound className="h-4 w-4" aria-hidden />
            Comercial
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Acessos comerciais
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
            Controle manual de VIP, Bolão e Lojinha via{" "}
            <code className="text-gold-200/90">public.user_entitlements</code>.
            Não altera Mercado Pago, bolão ou permissões admin.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-gold-400/30 hover:text-white"
        >
          ← Painel
        </Link>
      </div>

      <AdminAccessGrantForm />

      <section className="overflow-hidden rounded-2xl border border-gold-400/12 bg-black/35">
        <div className="border-b border-stone-800 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-white">Acessos concedidos</h2>
          <p className="mt-1 text-sm text-stone-500">
            {rows.length} registro{rows.length === 1 ? "" : "s"} encontrado{rows.length === 1 ? "" : "s"}.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-stone-500">
            Nenhum acesso comercial registrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-stone-950/80 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Acesso</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Expiração</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/70">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{row.user_email || row.user_id}</p>
                      <p className="font-mono text-[10px] text-stone-600">{row.user_id}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {entitlementLabels[row.entitlement] ?? row.entitlement}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-stone-700 bg-stone-900 px-2 py-1 text-xs text-stone-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400">{formatDate(row.starts_at)}</td>
                    <td className="px-4 py-3 text-stone-400">{formatDate(row.expires_at)}</td>
                    <td className="px-4 py-3 text-stone-500">{row.source}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={revokeAccessAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-950/40"
                        >
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
