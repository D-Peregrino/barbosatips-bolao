import Link from "next/link";
import { Send, Users, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * CTAs estratégicos na home — Telegram + YouTube + link hub.
 */
export function HomeCommunityHubStrip() {
  const { hub } = siteConfig;

  return (
    <section
      aria-label="Junta-te à comunidade"
      className="border-y border-gold-400/10 bg-gradient-to-r from-[#0a0906] via-[#080706] to-[#0a0906]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/5">
            <Users className="h-5 w-5 text-gold-300" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
              Comunidade ao vivo
            </p>
            <p className="mt-0.5 text-sm font-medium text-stone-400">
              O hub BarbosaTips — alertas, vídeos e conversa com a malta.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:justify-end">
          <a
            href={hub.telegramCanal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-bold text-white shadow-lg shadow-[#229ED9]/15 transition hover:brightness-110 sm:flex-none sm:px-5"
          >
            <Send className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
            Telegram
          </a>
          <a
            href={hub.youtubeCanalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/25 px-4 text-sm font-bold text-red-100 transition hover:border-red-400/45 sm:flex-none sm:px-5"
          >
            <Youtube className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
            YouTube
          </a>
          <Link
            href="/comunidade"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gold-400/25 bg-black/30 px-4 text-sm font-semibold text-gold-200/95 transition hover:border-gold-300/45"
          >
            Ver hub
          </Link>
        </div>
      </div>
    </section>
  );
}
