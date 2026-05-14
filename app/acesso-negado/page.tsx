import Link from "next/link";
import { BrandShield } from "@/components/brand/BrandShield";

type Props = {
  searchParams: { motivo?: string };
};

function copyForMotivo(motivo: string | undefined) {
  if (motivo === "config") {
    return {
      title: "Autenticação indisponível",
      body: "O servidor não consegue validar sessões neste ambiente (Supabase ao vivo desligado ou mal configurado). As áreas administrativas ficam bloqueadas por segurança.",
    };
  }
  if (motivo === "permissao") {
    return {
      title: "Sem permissão de administrador",
      body: "A tua conta está autenticada, mas não tem perfil de admin na BarbosaTips. Se precisares de acesso, contacta a equipa responsável.",
    };
  }
  return {
    title: "Acesso restrito",
    body: "Esta área é exclusiva da equipa BarbosaTips. Volta ao site público ou inicia sessão com uma conta autorizada.",
  };
}

export default function AcessoNegadoPage({ searchParams }: Props) {
  const { title, body } = copyForMotivo(searchParams.motivo);

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 50% -15%, rgba(212,175,55,.28), transparent 58%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(201,162,39,.12), transparent 50%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,.2)_0%,rgba(5,6,8,.92)_100%)]" />

      <main className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:py-24">
        <div className="mb-6 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/[0.07] p-4 shadow-[0_0_60px_-20px_rgba(212,175,55,.45)]">
          <BrandShield size="lg" className="opacity-95" glow="medium" />
        </div>

        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8D48B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F0D78C]" aria-hidden />
          BarbosaTips · Área interna
        </p>

        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">{body}</p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3 text-sm font-semibold text-[#0a0a0a] shadow-[0_14px_44px_-14px_rgba(212,175,55,.55)] transition hover:brightness-110"
          >
            Iniciar sessão
          </Link>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-900/60 px-5 py-3 text-sm font-semibold text-zinc-100 backdrop-blur-sm transition hover:border-[#C9A227]/40 hover:bg-zinc-900"
          >
            Ir ao site
          </Link>
        </div>

        <p className="mt-10 text-[11px] text-zinc-600">
          Pedido bloqueado · sem indexação · apenas equipa autorizada
        </p>
      </main>
    </div>
  );
}
