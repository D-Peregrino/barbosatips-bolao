"use client";

import { useFormState, useFormStatus } from "react-dom";
import { UserMinus, UserPlus } from "lucide-react";
import {
  promoverAdminPorEmailAction,
  removerAdminAction,
  type AdminUsersActionResult,
} from "@/app/admin/(panel)/admins-actions";
import type { AdminUserRow } from "@/lib/admin/admin-users";

const estadoInicial: AdminUsersActionResult = { ok: false, error: "" };

function PromoverButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition enabled:hover:brightness-110 disabled:opacity-50"
    >
      <UserPlus className="h-4 w-4" aria-hidden />
      {pending ? "A promover…" : "Promover para admin"}
    </button>
  );
}

function RemoverButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <UserMinus className="h-3.5 w-3.5" aria-hidden />
      {pending ? "A remover…" : "Remover admin"}
    </button>
  );
}

type Props = {
  admins: AdminUserRow[];
  actorUserId: string;
  ultimoAdmin: boolean;
};

function formatarData(iso: string): string {
  if (!iso.trim()) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export function AdminUsersManager({ admins, actorUserId, ultimoAdmin }: Props) {
  const [promoverState, promoverAction] = useFormState(
    promoverAdminPorEmailAction,
    estadoInicial,
  );
  const [removerState, removerAction] = useFormState(removerAdminAction, estadoInicial);

  const erroPromover = promoverState?.ok === false ? promoverState.error : "";
  const erroRemover = removerState?.ok === false ? removerState.error : "";
  const sucessoPromover = promoverState?.ok === true;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-gold-400/15 bg-[#0c0b09]/90 p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-white">Promover utilizador</h2>
        <p className="mt-2 max-w-xl text-sm text-stone-400">
          A conta deve existir no Supabase Auth (registo ou criação em Authentication). A
          alteração grava <code className="text-gold-200/90">public.users.role = admin</code>.
        </p>

        <form action={promoverAction} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="admin-promote-email"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500"
            >
              Email
            </label>
            <input
              id="admin-promote-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="utilizador@exemplo.com"
              className="w-full rounded-xl border border-white/10 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50"
            />
          </div>
          <PromoverButton />
        </form>

        {erroPromover ? (
          <p className="mt-3 text-sm text-red-300" role="alert">
            {erroPromover}
          </p>
        ) : null}
        {sucessoPromover ? (
          <p className="mt-3 text-sm text-emerald-300">
            Administrador promovido com sucesso.
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-white">
          Administradores ({admins.length})
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Apenas contas com role <span className="text-gold-200/90">admin</span> acedem ao painel.
        </p>

        {erroRemover ? (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
            {erroRemover}
          </p>
        ) : null}

        {ultimoAdmin ? (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Existe apenas um administrador — não é possível remover o último.
          </p>
        ) : null}

        {admins.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">Nenhum administrador listado.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-[#14120e] text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Desde</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((row) => {
                  const eEu = row.id === actorUserId;
                  const bloquearRemover = ultimoAdmin;
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-white/5 odd:bg-black/20"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {row.email || "—"}
                        {eEu ? (
                          <span className="ml-2 text-[10px] font-bold uppercase text-gold-300/90">
                            (você)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200">
                          {row.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                        {formatarData(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={removerAction} className="inline">
                          <input type="hidden" name="user_id" value={row.id} />
                          <RemoverButton disabled={bloquearRemover} />
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
