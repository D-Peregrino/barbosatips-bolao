import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Sparkles, Zap, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";

const base = siteConfig.url.replace(/\/$/, "");

export const metadata: Metadata = {
  title: `Premium | ${siteConfig.shortTitle}`,
  description:
    "Análises e picks exclusivos, odd e confiança — BarbosaTips Premium com acesso total.",
  alternates: { canonical: `${base}/premium` },
  robots: { index: true, follow: true },
};

const beneficios = [
  {
    icon: Sparkles,
    titulo: "Conteúdo completo",
    texto: "Análises longas e picks rápidas sem borrão — leitura integral no portal.",
  },
  {
    icon: Zap,
    titulo: "Antecipação",
    texto: "Linhas de valor e mercados selecionados antes da massa.",
  },
  {
    icon: Shield,
    titulo: "Sem ruído",
    texto: "Foco em prognóstico profissional, odd sugerida e nível de confiança.",
  },
];

export default function PremiumPage() {
  const tg = siteConfig.social.telegram;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#020201] pb-24 pt-10 text-zinc-100 sm:pt-14">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(217,119,6,.18),transparent_50%)]"
        aria-hidden
      />

      <div className="container-site max-w-4xl">
        <header className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            <Lock className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            Premium
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            BarbosaTips <span className="text-amber-400">Premium</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Acesso total a análises e picks marcados como premium — o mesmo visual preto e dourado
            do portal, com conteúdo desbloqueado para assinantes.
          </p>
        </header>

        <section id="beneficios" className="mt-16 scroll-mt-24">
          <h2 className="text-center font-display text-xl font-bold text-white sm:text-2xl">
            Benefícios
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {beneficios.map(({ icon: Icon, titulo, texto }) => (
              <li
                key={titulo}
                className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#0c0a06] to-black p-6 text-center shadow-[0_20px_50px_-28px_rgba(0,0,0,.85)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/50 text-amber-400">
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-amber-100">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="planos"
          className="mt-16 scroll-mt-24 rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#120f08] via-black to-black p-8 text-center shadow-[0_32px_80px_-28px_rgba(217,119,6,.15)] sm:p-12"
        >
          <h2 className="font-display text-2xl font-bold text-white">Assinatura</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-500">
            O pagamento recorrente (Mercado Pago ou outro) será ligado aqui em breve. Enquanto isso,
            contacta-nos ou entra no canal VIP no Telegram para filas de acesso antecipado.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={tg}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            >
              CTA Telegram VIP
            </a>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center rounded-xl border border-amber-500/45 bg-black/50 px-8 py-3.5 text-sm font-bold text-amber-100 transition hover:bg-amber-950/30"
            >
              CTA assinatura — Contacto
            </Link>
          </div>
          <p className="mt-6 text-xs text-zinc-600">
            Conta premium: o administrador activa{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">
              is_subscriber_premium
            </code>{" "}
            no Supabase para o teu utilizador.
          </p>
        </section>

        <div className="mt-12 text-center">
          <Link href="/" className="text-sm font-medium text-amber-500/90 hover:text-amber-400">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
