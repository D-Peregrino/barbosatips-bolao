"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAdminPanelAction, type AdminLoginState } from "@/app/admin/actions";

const INITIAL: AdminLoginState = { error: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-3.5 text-sm font-extrabold text-[#0a0a0a] shadow-[0_16px_44px_-14px_rgba(212,175,55,.45)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "A entrar…" : "Entrar no painel"}
    </button>
  );
}

type Props = {
  redirectTo: string;
};

export function AdminLoginForm({ redirectTo }: Props) {
  const [state, formAction] = useFormState(loginAdminPanelAction, INITIAL);

  return (
    <form action={formAction} className="mt-10 rounded-2xl border border-gold-400/15 bg-[#0c0b09]/95 p-6 shadow-[0_28px_80px_-40px_rgba(0,0,0,.9)] sm:p-8">
      <input type="hidden" name="redirect" value={redirectTo} />
      <label className="block text-xs font-semibold uppercase tracking-wide text-stone-400">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-gold-400/40"
          placeholder="admin@dominio.com"
        />
      </label>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400/40"
          placeholder="••••••••"
        />
      </label>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-red-500/35 bg-red-950/30 px-3 py-2 text-sm text-red-100" role="alert">
          {state.error}
        </p>
      ) : null}
      <Submit />
      <p className="mt-6 text-center text-[11px] leading-relaxed text-stone-500">
        Cookie httpOnly assinado · logout no painel apaga a sessão em todos os módulos deste login.
      </p>
    </form>
  );
}
