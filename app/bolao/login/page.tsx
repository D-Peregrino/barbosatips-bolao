"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginBolaoParticipante } from "@/app/bolao/login/actions";

const BOLAO_PARTICIPANTE_LS = "barbosatips:bolao:participante";

export default function BolaoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    setErro("");
    setEnviando(true);
    try {
      const res = await loginBolaoParticipante(email, senha);
      if (!res.ok) {
        const err = new Error(res.error);
        console.error(err);
        setErro(err.message);
        return;
      }
      try {
        localStorage.setItem(
          BOLAO_PARTICIPANTE_LS,
          JSON.stringify({ nome: res.nome, email: res.email }),
        );
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error(err);
        setErro("Não foi possível salvar a sessão neste dispositivo.");
        return;
      }
      router.push("/bolao/palpites");
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error(err);
      setErro(err.message);
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
          Entrar no{" "}
          <span className="bg-gradient-to-r from-[#F7E7B5] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
            bolão
          </span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Digite o e-mail cadastrado no bolão e sua senha.
        </p>

        <div
          className="mt-4 rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/95"
          role="note"
        >
          <p className="font-semibold text-amber-200">Aviso</p>
          <p className="mt-1 leading-relaxed text-amber-100/90">
            Por enquanto, sua senha é seu próprio e-mail (tudo em minúsculas, igual ao
            cadastro).
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-5 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-9 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
            <div>
              <h2 className="font-serif text-lg font-bold text-white sm:text-xl">Login</h2>
              <p className="text-xs text-zinc-500">Acesso à área de palpites</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="bolao-login-email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
              >
                E-mail
              </label>
              <input
                id="bolao-login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={enviando}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="bolao-login-senha"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
              >
                Senha
              </label>
              <input
                id="bolao-login-senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={enviando}
                placeholder="Igual ao e-mail"
                className="w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)] disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleEntrar()}
              disabled={enviando}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#e8c96b] via-[#d4af37] to-[#b8922b] py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-black shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {enviando ? "Entrando…" : "Entrar"}
            </button>

            {erro ? (
              <div
                className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                <pre className="whitespace-pre-wrap font-sans">{erro}</pre>
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Ainda não se inscreveu?{" "}
            <a
              href="/bolao"
              className="font-semibold text-[#C9A227] underline-offset-4 hover:underline"
            >
              Voltar à inscrição
            </a>
          </p>
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
