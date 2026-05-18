"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandShield } from "@/components/brand/BrandShield";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

function LoginFormContent() {
  const { signInWithGoogle, loading } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("next") || searchParams.get("redirect") || "/acesso";
  const callbackError = searchParams.get("erro");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col justify-center px-4 py-16">
      <div className="commercial-card-elevated border p-8 text-center shadow-[0_32px_80px_-40px_rgba(201,162,39,0.25)]">
        <BrandShield size="md" className="mx-auto" glow="soft" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Entrar na BarbosaTips</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Entrada de cliente VIP. Bolão e Admin usam acessos próprios em /acesso.
        </p>
        {sent ? (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
            Link enviado para seu e-mail. Abra o link neste navegador para concluir o login.
          </p>
        ) : null}
        {callbackError ? (
          <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
            Não foi possível concluir o login pelo link. Solicite um novo link de acesso.
          </p>
        ) : null}
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <form
          className="mt-8 space-y-3 text-left"
          onSubmit={async (event) => {
            console.log("[LOGIN] submit");
            event.preventDefault();
            setErr(null);
            setSent(false);
            const cleanEmail = email.trim().toLowerCase();
            console.log("[LOGIN] email", cleanEmail);
            if (!cleanEmail || !cleanEmail.includes("@")) {
              setErr("Informe um e-mail válido.");
              return;
            }
            setSending(true);
            try {
              const supabase = createClient();
              const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`;
              console.log("[LOGIN] emailRedirectTo", emailRedirectTo);
              const { error } = await supabase.auth.signInWithOtp({
                email: cleanEmail,
                options: {
                  emailRedirectTo,
                },
              });
              if (error) throw error;
              setSent(true);
            } catch {
              setErr("Não foi possível enviar o link de acesso. Tente novamente.");
            } finally {
              setSending(false);
            }
          }}
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            E-mail da sua assinatura VIP
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="voce@email.com"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-gold-400/55"
          />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 py-3 text-sm font-bold text-pitch-950 transition hover:brightness-105 disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Receber link de acesso"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            ou
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            try {
              await signInWithGoogle(redirect);
            } catch {
              setErr("Não foi possível iniciar sessão. Tenta novamente.");
            }
          }}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
        >
          Continuar com Google
        </button>
        <p className="mt-4 text-[11px] text-zinc-600">
          Após entrar você será redirecionado para{" "}
          <span className="text-zinc-400">{redirect}</span>
        </p>
        <Link href="/" className="mt-6 inline-block text-xs font-semibold text-gold-300 hover:underline">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}

export function ClientLoginForm() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] animate-pulse bg-black/40" />}>
      <LoginFormContent />
    </Suspense>
  );
}
