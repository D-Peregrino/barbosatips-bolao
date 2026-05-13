"use client";

import { useState } from "react";
import { inscreverBolaoCopa2026 } from "@/app/bolao/inscricao/actions";

export default function BolaoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleInscricao() {
    setErro("");
    setSucesso(false);
    setEnviando(true);
    try {
      const res = await inscreverBolaoCopa2026(nome, email);
      if (!res.ok) {
        setErro(res.error);
        return;
      }
      setSucesso(true);
      setNome("");
      setEmail("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(msg || "Falha ao enviar inscrição.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.25), transparent 55%)",
        }}
      />

      <main className="relative mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
          BarbosaTips · Bolão
        </div>

        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Bolão Copa do Mundo 2026
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Preencha seus dados para se inscrever. Depois, entre com seu e-mail na área de
          login para enviar seus palpites.
        </p>

        <section className="mt-8 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-5 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-9 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
            <div>
              <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                Inscrição
              </h2>
              <p className="text-xs text-zinc-500">Copa 2026 · fase de grupos</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="bolao-insc-nome"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
              >
                Nome
              </label>
              <input
                id="bolao-insc-nome"
                type="text"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={enviando}
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="bolao-insc-email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
              >
                E-mail
              </label>
              <input
                id="bolao-insc-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={enviando}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)] disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleInscricao()}
              disabled={enviando}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#e8c96b] via-[#d4af37] to-[#b8922b] py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-black shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Fazer inscrição"}
            </button>

            {erro ? (
              <div
                className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                <pre className="whitespace-pre-wrap font-sans">{erro}</pre>
              </div>
            ) : null}

            {sucesso ? (
              <div
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-200"
                role="status"
              >
                <p className="font-semibold">Inscrição realizada com sucesso.</p>
                <p className="mt-2 text-xs leading-relaxed text-emerald-100/90">
                  Agora faça login com o mesmo e-mail para acessar os palpites. Por
                  enquanto, use o próprio e-mail como senha.
                </p>
                <a
                  href="/bolao/login"
                  className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-950/50 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-emerald-200 transition hover:bg-emerald-900/60"
                >
                  Entrar para fazer palpites
                </a>
              </div>
            ) : null}
          </div>

          <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
            <p className="text-xs text-zinc-500">Já se inscreveu?</p>
            <a
              href="/bolao/login"
              className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900 px-6 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-zinc-200 transition hover:border-[#C9A227]/45 hover:text-[#F0D78C]"
            >
              Já sou inscrito, entrar
            </a>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] text-zinc-600">
          <a
            href="/bolao"
            className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline"
          >
            Fazer inscrição
          </a>
          <span className="mx-2 text-zinc-700" aria-hidden>
            ·
          </span>
          <a
            href="/bolao/login"
            className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline"
          >
            Entrar
          </a>
        </p>
      </main>
    </div>
  );
}
