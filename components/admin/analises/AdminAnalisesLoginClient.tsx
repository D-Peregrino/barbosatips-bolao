"use client";

import { Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAdminAnalisesFormAction } from "@/app/admin/analises/auth-actions";
import { LOGIN_ANALISES_FORM_INITIAL } from "@/lib/admin/analises-login-form-state";

const MSG_SEM_PASSWORD = (
  <>
    <strong className="block text-white">
      ADMIN_ANALISES_PASSWORD não está definida no servidor.
    </strong>
    <span className="mt-2 block text-zinc-200">
      No Vercel: <strong>Settings</strong> → <strong>Environment Variables</strong>{" "}
      → crie <code className="text-[#F0D78C]">ADMIN_ANALISES_PASSWORD</code> para
      os ambientes em que faz deploy (<strong>Production</strong> e/ou{" "}
      <strong>Preview</strong>), guarde e execute um <strong>Redeploy</strong>. Sem
      redeploy, o runtime continua sem a variável.
    </span>
  </>
);

const MSG_ERRO_CONFIG = (
  <>
    <strong className="block text-white">
      Segredo de sessão editorial indisponível no servidor.
    </strong>
    <span className="mt-2 block text-zinc-200">
      Defina <code className="text-[#F0D78C]">ADMIN_ANALISES_PASSWORD</code> ou{" "}
      <code className="text-[#F0D78C]">ADMIN_ANALISES_SESSION_SECRET</code> nas
      variáveis de ambiente e faça <strong>Redeploy</strong>.
    </span>
  </>
);

type Props = {
  senhaAdminConfigurada: boolean;
};

function SubmitButton({
  disabledForm,
}: {
  disabledForm: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabledForm}
      className="w-full rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] py-3 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

function AdminAnalisesLoginForm({ senhaAdminConfigurada }: Props) {
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState(
    loginAdminAnalisesFormAction,
    LOGIN_ANALISES_FORM_INITIAL,
  );

  const erroUrl = searchParams.get("erro");
  const avisoConfig = erroUrl === "config" ? MSG_ERRO_CONFIG : null;
  const avisoSemPassword = !senhaAdminConfigurada ? MSG_SEM_PASSWORD : null;
  const bloqueado = !senhaAdminConfigurada;
  const erroForm = state.error;

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
          Sessão simples por cookie httpOnly após a senha correta; redirecionamento
          para o painel <code className="text-[#C9A227]/90">/admin/analises</code>.
        </p>

        <section className="mt-8 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-6 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm sm:p-8">
          {avisoSemPassword ? (
            <p
              className="mb-4 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-3 text-sm text-red-100"
              role="alert"
            >
              {avisoSemPassword}
            </p>
          ) : null}

          {!avisoSemPassword && avisoConfig ? (
            <p
              className="mb-4 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-3 text-sm text-red-100"
              role="alert"
            >
              {avisoConfig}
            </p>
          ) : null}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="admin-analises-senha"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
              >
                Senha admin
              </label>
              <input
                id="admin-analises-senha"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-[#C9A227]/60 disabled:opacity-50"
                placeholder="••••••••"
                disabled={bloqueado}
              />
            </div>

            {erroForm ? (
              <p className="text-sm text-red-400" role="alert">
                {erroForm}
              </p>
            ) : null}

            <SubmitButton disabledForm={bloqueado} />
          </form>
        </section>
      </main>
    </div>
  );
}

export function AdminAnalisesLoginClient(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#050608] text-sm text-zinc-400">
          A carregar login…
        </div>
      }
    >
      <AdminAnalisesLoginForm {...props} />
    </Suspense>
  );
}
