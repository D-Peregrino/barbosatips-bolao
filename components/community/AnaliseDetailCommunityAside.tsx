import { ExternalLink, Send, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";

type Props = {
  /** Texto opcional para pesquisa no YouTube (ex.: confronto). */
  youtubeSearchQuery?: string;
};

export function AnaliseDetailCommunityAside({ youtubeSearchQuery }: Props) {
  const { hub } = siteConfig;
  const searchUrl = youtubeSearchQuery?.trim()
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeSearchQuery.trim())}`
    : hub.youtubeCanalUrl;

  return (
    <aside className="mt-12 space-y-6">
      <div className="rounded-2xl border border-[#C9A227]/35 bg-gradient-to-br from-[#1a1610] to-[#0c0b09] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Comunidade
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Alertas rápidos, contexto extra e conversa com outros seguidores no Telegram oficial.
        </p>
        <a
          href={hub.telegramCanal}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3 text-sm font-bold text-white transition hover:brightness-110 sm:w-auto sm:px-8"
        >
          <Send className="h-4 w-4" aria-hidden />
          Entrar no Telegram
        </a>
      </div>

      <div className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/30 to-[#0c0b09] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300/90">
          Vídeo no canal
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Vê análises em formato vídeo, resumos e conteúdo extra no YouTube — incluindo shorts quando
          disponíveis.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a
            href={hub.youtubeCanalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/35 bg-red-950/40 px-5 py-3 text-sm font-bold text-red-50 transition hover:border-red-300/55"
          >
            <Youtube className="h-4 w-4" aria-hidden />
            Canal YouTube
          </a>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Vídeos relacionados
          </a>
        </div>
      </div>
    </aside>
  );
}
