import Link from "next/link";
import { Send, Users, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * CTAs estratégicos na home — Telegram + YouTube + hub (contraste e hierarquia fortes).
 */
export function HomeCommunityHubStrip() {
  const { hub } = siteConfig;

  return (
    <section
      aria-label="Junta-te à comunidade"
      className="border-y border-white/[0.06] bg-gradient-to-r from-[#12141c]/90 via-[#0a0b10]/95 to-[#12141c]/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-5 sm:py-7">
        <div className="flex min-w-0 items-start gap-4 sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold-400/25 bg-gold-400/[0.08] shadow-[0_0_32px_-8px_rgba(201,162,39,0.35)]">
            <Users className="h-6 w-6 text-gold-200" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-300/95">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/55 opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Comunidade ao vivo
            </p>
            <p className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-lg">
              O hub BarbosaTips — alertas instantâneos e análise em vídeo.
            </p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-300">
              Telegram para linhas e avisos; YouTube para contexto completo. Sem ruído de algoritmo.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[min(100%,320px)]">
          <a
            href={hub.telegramCanal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] px-5 text-[15px] font-extrabold text-white shadow-[0_18px_44px_-14px_rgba(34,158,217,0.55)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <Send className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
            Telegram — alertas
          </a>
          <a
            href={hub.youtubeCanalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border-2 border-red-500/45 bg-red-950/35 px-5 text-[15px] font-extrabold text-red-50 transition hover:border-red-400/65 hover:bg-red-950/45 active:scale-[0.99]"
          >
            <Youtube className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
            YouTube — análises
          </a>
          <Link
            href="/comunidade"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-gold-400/30 bg-black/35 px-5 text-sm font-semibold text-gold-100 transition hover:border-gold-300/50 hover:bg-black/45"
          >
            Explorar hub completo
          </Link>
        </div>
      </div>
    </section>
  );
}
