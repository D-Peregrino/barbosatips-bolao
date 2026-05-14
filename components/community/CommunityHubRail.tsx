import Link from "next/link";
import { Send, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Widget na coluna lateral (desktop) — Telegram + YouTube com hierarquia forte.
 */
export function CommunityHubRail() {
  const { hub } = siteConfig;

  return (
    <aside
      aria-label="Comunidade BarbosaTips"
      className="rounded-2xl border border-gold-400/18 bg-gradient-to-b from-[#14110c]/98 to-[#080706]/98 p-4 shadow-[0_24px_56px_-28px_rgba(0,0,0,.88)]"
    >
      <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-gold-300/90">
        Junta-te
      </p>
      <p className="mt-1 text-center text-[11px] leading-snug text-stone-300">
        Alertas e vídeo — mesmo rigor BarbosaTips.
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        <a
          href={hub.telegramCanal}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-[#229ED9]/35 bg-[#229ED9]/12 px-2 py-2.5 text-center transition hover:border-[#229ED9]/55 hover:bg-[#229ED9]/18"
        >
          <Send className="h-5 w-5 text-[#7dd3fc]" strokeWidth={2.2} aria-hidden />
          <span className="text-[11px] font-extrabold leading-tight text-white">Telegram</span>
          <span className="text-[9px] font-medium text-sky-200/90">Alertas</span>
        </a>
        <a
          href={hub.youtubeCanalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-red-500/35 bg-red-950/25 px-2 py-2.5 text-center transition hover:border-red-400/50 hover:bg-red-950/35"
        >
          <Youtube className="h-5 w-5 text-red-300" strokeWidth={2.2} aria-hidden />
          <span className="text-[11px] font-extrabold leading-tight text-white">YouTube</span>
          <span className="text-[9px] font-medium text-red-200/85">Análises</span>
        </a>
      </div>
      <Link
        href="/comunidade"
        className="mt-4 block rounded-lg py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-gold-200/95 underline-offset-2 hover:underline"
      >
        Hub comunidade →
      </Link>
    </aside>
  );
}
