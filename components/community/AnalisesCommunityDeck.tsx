import { Send, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Faixa compacta na listagem de análises — Telegram + vídeos no YouTube.
 */
export function AnalisesCommunityDeck() {
  const { hub } = siteConfig;

  return (
    <div className="mb-10 flex flex-col gap-3 rounded-2xl border border-[#3d3420]/80 bg-[linear-gradient(135deg,rgba(26,22,16,.95),rgba(8,7,6,.98))] p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,.75)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
        <span className="font-semibold text-[#E8D48B]">Comunidade:</span>{" "}
        recebe alertas no Telegram e acompanha análises em vídeo no canal YouTube BarbosaTips.
      </p>
      <div className="flex flex-shrink-0 flex-wrap gap-2">
        <a
          href={hub.telegramCanal}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-bold text-white transition hover:brightness-110"
        >
          <Send className="h-4 w-4" aria-hidden />
          Telegram
        </a>
        <a
          href={hub.youtubeCanalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-950/30 px-4 text-sm font-bold text-red-100 transition hover:border-red-400/50"
        >
          <Youtube className="h-4 w-4" aria-hidden />
          Análises em vídeo
        </a>
      </div>
    </div>
  );
}
