import Link from "next/link";
import { Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { YouTubeResponsiveEmbed } from "@/components/community/YouTubeResponsiveEmbed";
import {
  fetchYoutubeVideoIdsFromChannelRss,
  mergeYoutubeVideoIds,
} from "@/lib/youtube/rss-videos";

async function resolveLatestVideoIds(limit: number): Promise<string[]> {
  const { hub } = siteConfig;
  const rss = await fetchYoutubeVideoIdsFromChannelRss(hub.youtubeChannelRssId, limit);
  return mergeYoutubeVideoIds(rss, hub.youtubeFallbackVideoIds, limit);
}

export async function ComunidadeYoutubeSection() {
  const { hub } = siteConfig;
  const latest = await resolveLatestVideoIds(4);
  const shorts = [...hub.youtubeShortVideoIds];

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-400/90">
            YouTube
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Análises em <span className="text-gold-gradient">vídeo</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Vídeos completos e destaques do canal — o mesmo rigor BarbosaTips, agora em formato
            audiovisual.
          </p>
        </div>
        <a
          href={hub.youtubeCanalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-red-500/35 bg-red-950/30 px-5 py-2.5 text-sm font-bold text-red-100 transition hover:border-red-400/50"
        >
          Assistir no YouTube
        </a>
      </header>

      {latest.length > 0 ? (
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
            <Sparkles className="h-4 w-4 text-gold-400" aria-hidden />
            Últimos vídeos
          </h3>
          <div className="grid gap-6 lg:grid-cols-2">
            {latest.map((id, i) => (
              <YouTubeResponsiveEmbed
                key={id}
                videoId={id}
                title={`Vídeo BarbosaTips ${i + 1}`}
                variant="video"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-600/50 bg-zinc-950/40 px-6 py-12 text-center">
          <p className="text-sm font-medium leading-relaxed text-zinc-400">
            Os vídeos em destaque aparecem aqui assim que o canal tiver conteúdo listado. Entretanto,
            abre o YouTube para ver análises completas e atualizações.
          </p>
          <a
            href={hub.youtubeCanalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-red-300 underline-offset-2 hover:underline"
          >
            Assistir no YouTube →
          </a>
        </div>
      )}

      {shorts.length > 0 ? (
        <div>
          <h3 className="mb-4 font-display text-lg font-bold text-white">Shorts</h3>
          <div className="flex flex-wrap justify-center gap-6 md:justify-start">
            {shorts.map((id) => (
              <YouTubeResponsiveEmbed
                key={id}
                videoId={id}
                title={`Short BarbosaTips ${id}`}
                variant="short"
              />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-center text-xs text-zinc-600">
        Novos shorts e cortes passam também pelo canal oficial no YouTube.
      </p>
    </section>
  );
}

export function ComunidadeRoadmapSection() {
  const { hub } = siteConfig;
  const { roadmap } = hub;

  return (
    <section className="rounded-2xl border border-gold-400/15 bg-gradient-to-br from-[#14120e] to-[#080706] p-6 sm:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
        Em preparação
      </p>
      <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
        Próximos passos do ecossistema
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Sem sistema interno de comentários por agora — o foco é centralizar a comunidade que já
        existe noutros canais. O site prepara terreno para evoluções futuras.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        <li className="rounded-xl border border-white/8 bg-black/30 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Destaques</p>
          <p className="mt-1 text-sm font-semibold text-zinc-200">
            {roadmap.vipComunidade ? "Canais prioritários" : "Em breve"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Avisos e conteúdos reservados à comunidade mais próxima do projeto.
          </p>
        </li>
        <li className="rounded-xl border border-white/8 bg-black/30 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Membros</p>
          <p className="mt-1 text-sm font-semibold text-zinc-200">
            {roadmap.membrosDestaque ? "Membros em destaque" : "Em breve"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">Reconhecimento e perks para quem apoia o projeto.</p>
        </li>
        <li className="rounded-xl border border-white/8 bg-black/30 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Lives</p>
          <p className="mt-1 text-sm font-semibold text-zinc-200">
            {roadmap.livesProgramadas ? "Lives programadas" : "Em breve"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">Calendário e avisos integrados ao hub.</p>
        </li>
      </ul>
      <Link
        href="/comunidade"
        className="mt-6 inline-flex text-sm font-semibold text-gold-300 underline-offset-2 hover:underline"
      >
        Ver comunidade e canais oficiais →
      </Link>
    </section>
  );
}
