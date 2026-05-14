import Link from "next/link";
import { Send, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Texto curto por página (ex.: “Após cada jornada”). */
  kicker?: string;
};

/**
 * CTA forte Telegram + YouTube — reutilizável em páginas públicas (portal vivo).
 */
export function PortalSocialCtaBand({ className, kicker }: Props) {
  const { hub } = siteConfig;

  return (
    <section
      aria-label="Segue a BarbosaTips nas redes"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold-400/18 bg-gradient-to-br from-[#0f0e0a] via-[#080706] to-[#0c0a08] p-5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.88)] sm:p-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#229ED9]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-red-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-300/95">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Canal ao vivo
          </p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            Telegram para alertas · YouTube para análise completa
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-300">
            {kicker ??
              "Linhas rápidas no Telegram; contexto e vídeo no YouTube — o mesmo rigor BarbosaTips."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
          <a
            href={hub.telegramCanal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] px-6 text-sm font-extrabold text-white shadow-[0_16px_44px_-16px_rgba(34,158,217,0.55)] transition hover:brightness-110 sm:min-w-[200px]"
          >
            <Send className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
            Entrar na comunidade
          </a>
          <a
            href={hub.youtubeCanalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2.5 rounded-xl border-2 border-red-500/45 bg-red-950/35 px-6 text-sm font-extrabold text-red-50 transition hover:border-red-400/70 hover:bg-red-950/50 sm:min-w-[200px]"
          >
            <Youtube className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
            Assistir no YouTube
          </a>
          <Link
            href="/comunidade"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gold-400/30 bg-black/40 px-5 text-sm font-semibold text-gold-100 transition hover:border-gold-300/50 sm:px-6"
          >
            Ver hub BarbosaTips
          </Link>
        </div>
      </div>
    </section>
  );
}
