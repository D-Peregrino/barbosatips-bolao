import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { listarUsuariosAdmin } from "@/lib/admin/admin-users";
import { requireAdminActor } from "@/lib/admin/require-admin-actor";

export const metadata = {
  title: "Administradores · BarbosaTips",
};

export const dynamic = "force-dynamic";

export default async function AdminAdministradoresPage() {
  const gate = await requireAdminActor();
  if (!gate.ok) {
    redirect("/admin/login?redirect=/admin/admins");
  }

  const admins = await listarUsuariosAdmin();
  const ultimoAdmin = admins.length <= 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
            <Shield className="h-4 w-4" aria-hidden />
            Segurança
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Administradores
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
            Gira quem pode aceder ao painel central. As alterações actualizam{" "}
            <code className="text-gold-200/90">public.users.role</code> — sem expor senhas.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-gold-400/30 hover:text-white"
        >
          ← Painel
        </Link>
      </div>

      <AdminUsersManager
        admins={admins}
        actorUserId={gate.actor.userId}
        ultimoAdmin={ultimoAdmin}
      />
    </div>
  );
}
