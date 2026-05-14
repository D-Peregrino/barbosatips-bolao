import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; erro?: string };
}) {
  const redirectTo = searchParams.redirect ?? "/admin";
  const erro = searchParams.erro;

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,162,39,.22), transparent 55%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-400/95">
          BarbosaTips · Painel
        </p>
        <h1 className="mt-3 text-center font-display text-3xl font-bold text-white">
          Administração central
        </h1>
        <p className="mt-2 text-center text-sm text-stone-400">
          Sessão persistente e segura — acesso exclusivo da equipa.
        </p>

        {erro === "config" ? (
          <p
            className="mt-6 rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-center text-sm text-amber-100"
            role="alert"
          >
            Credenciais do painel não configuradas no servidor (ADMIN_PANEL_EMAIL / ADMIN_PANEL_PASSWORD).
          </p>
        ) : null}

        <Suspense fallback={<div className="mt-10 h-48 animate-pulse rounded-2xl bg-white/[0.04]" />}>
          <AdminLoginForm redirectTo={redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}
