"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SUPABASE_URL = "https://blrlplzjlnofhivtydxt.supabase.co";
const SUPABASE_KEY = "sb_publishable_mSK2fm2fX3YBbyJvsjEbEg_hF3RXYLb";

const PRECO_INSCRICAO = 50;

const MSG_EMAIL_DUPLICADO = "Este e-mail já está inscrito no bolão.";

const MSG_POS_INSCRICAO =
  "Inscrição registrada com sucesso. Faça login com seu e-mail para acessar a área de palpites quando quiser.";

function moedaBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Resposta REST do PostgREST / Supabase indica violação de unicidade (e-mail duplicado). */
function ehErroChaveDuplicada(textoCorpo: string, statusHttp: number): boolean {
  if (statusHttp === 409) return true;
  const s = textoCorpo.toLowerCase();
  if (
    s.includes("duplicate key") ||
    s.includes("unique constraint") ||
    s.includes("23505")
  ) {
    return true;
  }
  try {
    const j = JSON.parse(textoCorpo) as {
      code?: string | number;
      message?: string;
    };
    const codigo = String(j?.code ?? "");
    if (codigo === "23505") return true;
    const msg = String(j?.message ?? "").toLowerCase();
    if (
      msg.includes("duplicate key") ||
      msg.includes("unique constraint") ||
      msg.includes("already exists")
    ) {
      return true;
    }
  } catch {
    /* texto não é JSON */
  }
  return false;
}

export default function BolaoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [inscritos, setInscritos] = useState<number | null>(null);
  const [statsCarregando, setStatsCarregando] = useState(true);
  const [fluxoConcluido, setFluxoConcluido] = useState(false);
  const [emailInscrito, setEmailInscrito] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarCtaLoginDuplicado, setMostrarCtaLoginDuplicado] = useState(false);

  async function carregarEstatisticas() {
    setStatsCarregando(true);
    try {
      const resposta = await fetch(
        `${SUPABASE_URL}/rest/v1/inscricoes_bolao?select=id`,
        {
          method: "HEAD",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: "count=exact",
          },
        },
      );
      const faixa = resposta.headers.get("content-range");
      const correspondencia = faixa?.match(/\/(\d+)\s*$/);
      const total = correspondencia ? parseInt(correspondencia[1], 10) : 0;
      setInscritos(Number.isFinite(total) ? total : 0);
    } catch {
      setInscritos(null);
    } finally {
      setStatsCarregando(false);
    }
  }

  useEffect(() => {
    void carregarEstatisticas();
  }, []);

  /** Consulta rápida se o e-mail já existe (único no Supabase). */
  async function emailJaCadastrado(emailLower: string): Promise<boolean> {
    const url = `${SUPABASE_URL}/rest/v1/inscricoes_bolao?select=id&email=eq.${encodeURIComponent(emailLower)}&limit=1`;
    const resposta = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!resposta.ok) return false;
    const lista = (await resposta.json()) as unknown;
    return Array.isArray(lista) && lista.length > 0;
  }

  async function entrarNoBolao() {
    setErro("");
    setMostrarCtaLoginDuplicado(false);

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo || !emailLimpo) {
      setErro("Preencha nome e e-mail.");
      return;
    }

    setEnviando(true);
    try {
      if (await emailJaCadastrado(emailLimpo)) {
        setErro(MSG_EMAIL_DUPLICADO);
        setMostrarCtaLoginDuplicado(true);
        return;
      }

      const resposta = await fetch(`${SUPABASE_URL}/rest/v1/inscricoes_bolao`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          nome: nomeLimpo,
          email: emailLimpo,
          status_pagamento: "aguardando_pagamento",
          valor_pago: 50,
        }),
      });

      const texto = await resposta.text();

      if (!resposta.ok) {
        if (ehErroChaveDuplicada(texto, resposta.status)) {
          setErro(MSG_EMAIL_DUPLICADO);
          setMostrarCtaLoginDuplicado(true);
        } else {
          setErro(texto);
        }
        return;
      }

      setEmailInscrito(emailLimpo);
      setNome("");
      setEmail("");
      setFluxoConcluido(true);
      setMostrarCtaLoginDuplicado(false);
      void carregarEstatisticas();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setErro(`Falha de conexão: ${msg}`);
    } finally {
      setEnviando(false);
    }
  }

  function novaInscricao() {
    setFluxoConcluido(false);
    setEmailInscrito("");
    setErro("");
    setMostrarCtaLoginDuplicado(false);
  }

  const arrecadadoEstimado =
    inscritos === null ? null : inscritos * PRECO_INSCRICAO;

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.25), transparent 55%)",
        }}
      />

      <main className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-5xl">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]"
            aria-hidden
          />
          BarbosaTips · Bolão
        </div>

        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Bolão Copa do Mundo{" "}
          <span className="bg-gradient-to-r from-[#F7E7B5] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
            2026
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Inscrição oficial. Depois, entre com seu e-mail na página de login para lançar e editar
          palpites durante os dias do bolão.
        </p>

        <section
          className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
          aria-label="Resumo do bolão"
        >
          {[
            {
              titulo: "Inscritos",
              valor:
                statsCarregando || inscritos === null
                  ? "…"
                  : String(inscritos),
              subtitulo: "total na base",
            },
            {
              titulo: "Valor por inscrição",
              valor: moedaBRL(PRECO_INSCRICAO),
              subtitulo: "R$ 50 fixos nesta etapa",
            },
            {
              titulo: "Arrecadado estimado",
              valor:
                statsCarregando || arrecadadoEstimado === null
                  ? "…"
                  : moedaBRL(arrecadadoEstimado),
              subtitulo: "inscritos × R$ 50",
            },
          ].map((card) => (
            <article
              key={card.titulo}
              className="rounded-2xl border border-[#3d3420]/80 bg-gradient-to-b from-[#14110c]/95 to-[#0a0908]/95 p-4 shadow-[0_0_0_1px_rgba(212,175,55,.06)_inset] sm:p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a806f]">
                {card.titulo}
              </p>
              <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#F0D78C] tabular-nums sm:text-3xl">
                {card.valor}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{card.subtitulo}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-5 shadow-[0_24px_80px_-32px_rgba(212,175,55,.35)] backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-9 w-1 rounded-full bg-gradient-to-b from-[#F7E7B5] to-[#9a7628]" />
            <div>
              <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
                {fluxoConcluido ? "Inscrição registrada" : "Entrar no bolão"}
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {fluxoConcluido
                  ? "Seus dados estão na tabela de inscrições. Use o login para acessar os palpites."
                  : "Nome e e-mail são salvos no Supabase na tabela inscricoes_bolao."}
              </p>
            </div>
          </div>

          {fluxoConcluido ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-4 text-sm leading-relaxed text-emerald-200">
                {MSG_POS_INSCRICAO}
              </div>

              {emailInscrito ? (
                <p className="text-xs text-zinc-500">
                  E-mail cadastrado:{" "}
                  <span className="text-zinc-300">{emailInscrito}</span>
                </p>
              ) : null}

              <Link
                href="/bolao/login"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#e8c96b] via-[#d4af37] to-[#b8922b] py-3.5 text-center text-sm font-bold uppercase tracking-[0.08em] text-black shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition hover:brightness-105"
              >
                Ir para login
              </Link>

              <button
                type="button"
                onClick={novaInscricao}
                className="text-xs font-semibold text-[#C9A227] underline-offset-4 hover:underline"
              >
                Fazer outra inscrição
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bolao-nome"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
                >
                  Nome
                </label>
                <input
                  id="bolao-nome"
                  className="w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)] disabled:opacity-50"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setMostrarCtaLoginDuplicado(false);
                  }}
                  disabled={enviando}
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="bolao-email"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
                >
                  E-mail
                </label>
                <input
                  id="bolao-email"
                  type="email"
                  className="w-full rounded-xl border border-zinc-700/90 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#C9A227]/70 focus:shadow-[0_0_0_3px_rgba(201,162,39,.12)] disabled:opacity-50"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMostrarCtaLoginDuplicado(false);
                  }}
                  disabled={enviando}
                  autoComplete="email"
                />
              </div>

              <button
                type="button"
                onClick={() => void entrarNoBolao()}
                disabled={enviando}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#e8c96b] via-[#d4af37] to-[#b8922b] py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-black shadow-[0_12px_40px_-12px_rgba(212,175,55,.55)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Entrar no Bolão"}
              </button>

              {mostrarCtaLoginDuplicado ? (
                <Link
                  href="/bolao/login"
                  className="flex w-full items-center justify-center rounded-xl border border-[#C9A227]/50 bg-[#1a140c] py-3 text-center text-sm font-bold uppercase tracking-[0.06em] text-[#F0D78C] transition hover:border-[#C9A227] hover:bg-[#221a10]"
                >
                  Entrar para fazer meus palpites
                </Link>
              ) : null}

              {erro ? (
                <div className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                  <pre className="whitespace-pre-wrap font-sans">{erro}</pre>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
