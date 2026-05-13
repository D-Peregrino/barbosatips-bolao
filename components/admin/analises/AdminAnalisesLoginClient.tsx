"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { loginAdminAnalisesAction } from "@/app/admin/analises/auth-actions";

const MSG_ENV =
  "Configure ADMIN_ANALISES_PASSWORD no ambiente (ex.: Vercel ou .env.local).";

type Props = {
  senhaAdminConfigurada: boolean;
};

export function AdminAnalisesLoginClient({ senhaAdminConfigurada }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [pending, startTransition] = useTransition();

  const erroUrl = searchParams.get("erro");
  const avisoMiddleware =
    erroUrl === "config" ? MSG_ENV : null;
  const avisoEnv = !senhaAdminConfigurada ? MSG_ENV : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!senhaAdminConfigurada) {
      setErro(MSG_ENV);
      return;
    }
    startTransition(async () => {
      const res = await loginAdminAnalisesAction(senha);
      if (!res.ok) {
        setErro(res.error);
        return;
      }
      router.push("/admin/analises");
    });
  }

  const bloqueado = !senhaAdminConfigurada;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.25), transparent 55%)",
        }}
      />

      <main className="relative mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
          BarbosaTips · Admin Análises
        </div>

        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Acesso editorial
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Painel para criar e publicar análises. Variável{" "}
          <code className="text-[#C9A227]/90">ADMIN_ANALISES_PASSWORD</code>{" "}
          (independente do admin do bolão).
        </p>

        <section className="mt-8 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-6 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm sm:p-8">
          {avisoEnv || avisoMiddleware ? (
            <p
              className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {avisoEnv ?? avisoMiddleware}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-analises-senha"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
              >
                Senha admin
              </label>
              <input
                id="admin-analises-senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(ev) => setSenha(ev.target.value)}
                className="w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-[#C9A227]/60 disabled:opacity-50"
                placeholder="••••••••"
                disabled={pending || bloqueado}
              />
            </div>

            {erro ? (
              <p className="text-sm text-red-400" role="alert">
                {erro}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending || !senha.trim() || bloqueado}
              className="w-full rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-3 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
