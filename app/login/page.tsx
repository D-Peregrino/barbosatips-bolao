"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandShield } from "@/components/brand/BrandShield";
import { useAuth } from "@/hooks/useAuth";

function LoginForm() {
  const { signInWithGoogle, loading } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/meu-feed";
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col justify-center px-4 py-16">
      <div className="commercial-card-elevated border p-8 text-center shadow-[0_32px_80px_-40px_rgba(201,162,39,0.25)]">
        <BrandShield size="md" className="mx-auto" glow="soft" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Entrar na BarbosaTips</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Usa a tua conta Google para favoritos, feed personalizado e notificações.
        </p>
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            try {
              await signInWithGoogle();
            } catch {
              setErr("Não foi possível iniciar sessão. Tenta novamente.");
            }
          }}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
        >
          Continuar com Google
        </button>
        <p className="mt-4 text-[11px] text-zinc-600">
          Após entrar serás redirecionado para{" "}
          <span className="text-zinc-400">{redirect}</span>
        </p>
        <Link href="/" className="mt-6 inline-block text-xs font-semibold text-gold-300 hover:underline">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] animate-pulse bg-black/40" />}>
      <LoginForm />
    </Suspense>
  );
}
