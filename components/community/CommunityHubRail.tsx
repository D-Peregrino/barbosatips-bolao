import { Send, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Widget discreto na coluna lateral (desktop) — Telegram + YouTube.
 */
export function CommunityHubRail() {
  const { hub } = siteConfig;

  return (
    <aside
      aria-label="Comunidade BarbosaTips"
      className="rounded-2xl border border-[#3d3420]/70 bg-gradient-to-b from-[#12100c]/95 to-[#080706]/98 p-3 shadow-[0_20px_50px_-28px_rgba(0,0,0,.8)]"
    >
      <p className="text-center text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        Hub
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <a
          href={hub.telegramCanal}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-xl border border-[#229ED9]/25 bg-[#229ED9]/10 px-2 py-2.5 text-center transition hover:border-[#229ED9]/45 hover:bg-[#229ED9]/15"
        >
          <Send className="h-4 w-4 text-[#54b4e8]" strokeWidth={2} aria-hidden />
          <span className="text-[10px] font-bold leading-tight text-zinc-200">Telegram</span>
        </a>
        <a
          href={hub.youtubeCanalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-xl border border-red-500/20 bg-red-950/20 px-2 py-2.5 text-center transition hover:border-red-400/35 hover:bg-red-950/30"
        >
          <Youtube className="h-4 w-4 text-red-400" strokeWidth={2} aria-hidden />
          <span className="text-[10px] font-bold leading-tight text-zinc-200">YouTube</span>
        </a>
      </div>
      <a
        href="/comunidade"
        className="mt-3 block text-center text-[9px] font-semibold text-[#C9A227]/90 underline-offset-2 hover:underline"
      >
        Comunidade →
      </a>
    </aside>
  );
}
