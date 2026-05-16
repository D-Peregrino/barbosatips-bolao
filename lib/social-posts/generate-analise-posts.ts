import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import { hashtagsAnalise } from "@/lib/social-posts/hashtags";
import { truncateTwitter } from "@/lib/social-posts/format";
import type { SocialLinks, SocialPostBundle } from "@/lib/social-posts/types";

function analiseUrl(links: SocialLinks, slug: string): string {
  return `${links.site}/analise/${slug}`;
}

function resumoCurto(a: AnaliseRow, max = 280): string {
  const base = a.resumo?.trim() || "";
  if (base.length > 0) return base.length > max ? `${base.slice(0, max - 1)}…` : base;
  const strip = a.conteudo
    .replace(/[#*_`>\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!strip) return "Análise completa no portal BarbosaTips.";
  return strip.length > max ? `${strip.slice(0, max - 1)}…` : strip;
}

function bundle(
  id: string,
  label: string,
  accent: SocialPostBundle["accent"],
  preview: SocialPostBundle["preview"],
  instagram: string,
  telegram: string,
  twitter: string,
  hashtags: string,
): SocialPostBundle {
  return {
    id,
    label,
    accent,
    preview,
    instagram,
    telegram,
    twitter: truncateTwitter(twitter),
    hashtags,
  };
}

export function generateAnaliseResumoPost(
  analise: AnaliseRow,
  links: SocialLinks,
): SocialPostBundle {
  const url = analiseUrl(links, analise.slug);
  const esporte = rotuloEsporte(analise.esporte);
  const tags = hashtagsAnalise(analise.esporte, analise.campeonato);
  const oddN = oddParaNumero(analise.odd);
  const odd = oddN > 0 ? `@${oddN.toFixed(2)}` : "";
  const confronto =
    analise.time_casa && analise.time_fora
      ? `${analise.time_casa} x ${analise.time_fora}`
      : analise.titulo;
  const resumo = resumoCurto(analise, 320);

  const instagram = [
    "📰 ANÁLISE · BarbosaTips",
    "",
    analise.titulo,
    confronto !== analise.titulo ? `⚽ ${confronto}` : "",
    analise.campeonato?.trim() ? `🏆 ${analise.campeonato}` : "",
    `🏷 ${esporte}`,
    odd ? `💰 Odd ref. ${odd} · ${analise.confianca}% conf.` : "",
    "",
    resumo,
    "",
    `🔗 Ler completa: ${url}`,
    "",
    tags,
  ]
    .filter(Boolean)
    .join("\n");

  const telegram = [
    "📰 *ANÁLISE* · BarbosaTips",
    "",
    `*${analise.titulo}*`,
    confronto ? `_${confronto}_` : "",
    "",
    resumo.slice(0, 400),
    "",
    `[Ler no site](${url})`,
    `[Telegram](${links.telegram})`,
  ]
    .filter(Boolean)
    .join("\n");

  const twitter = [
    `📰 ${analise.titulo}`,
    resumo.slice(0, 120),
    url,
    tags.split(" ").slice(0, 4).join(" "),
  ].join("\n");

  return bundle(
    "analise-resumo",
    "Resumo automático",
    "neutral",
    { title: "ANÁLISE", subtitle: analise.titulo.slice(0, 60), badge: esporte },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

export function generateAnaliseCtaTelegram(
  analise: AnaliseRow | null,
  links: SocialLinks,
): SocialPostBundle {
  const tags = hashtagsAnalise(analise?.esporte ?? "futebol", analise?.campeonato);
  const titulo = analise?.titulo ?? "BarbosaTips";
  const url = analise ? analiseUrl(links, analise.slug) : links.site;

  const instagram = [
    "📲 Entra no Telegram BarbosaTips",
    "",
    analise
      ? `Nova leitura no ar: ${titulo}`
      : "Picks, análises e avisos em tempo real — sem algoritmo a esconder greens.",
    "",
    "✅ Alertas de picks",
    "✅ Comunidade activa",
    "✅ Link directo ao portal",
    "",
    `👉 ${links.telegram}`,
    analise ? `📰 Análise: ${url}` : `🌐 ${links.site}`,
    "",
    tags,
  ].join("\n");

  const telegram = [
    "📲 *CTA Telegram*",
    "",
    analise ? `Acabámos de publicar: *${titulo}*` : "Junta-te ao canal oficial BarbosaTips.",
    "",
    `[Entrar no Telegram](${links.telegram})`,
    analise ? `[Ver análise](${url})` : `[Site](${links.site})`,
  ].join("\n");

  const twitter = [
    "📲 Telegram BarbosaTips — picks e análises em primeira mão",
    links.telegram,
    tags.split(" ").slice(0, 3).join(" "),
  ].join("\n");

  return bundle(
    "analise-cta-telegram",
    "CTA Telegram",
    "violet",
    { title: "TELEGRAM", subtitle: titulo.slice(0, 50), badge: "CTA" },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

export function generateAnaliseCtaYoutube(
  analise: AnaliseRow | null,
  links: SocialLinks,
): SocialPostBundle {
  const tags = buildHashtagsYoutube();
  const titulo = analise?.titulo ?? "BarbosaTips";
  const url = analise ? analiseUrl(links, analise.slug) : links.site;

  const instagram = [
    "▶️ YouTube BarbosaTips",
    "",
    analise
      ? `Vídeo + leitura: complementa a análise «${titulo}» no canal.`
      : "Conteúdo em vídeo, bastidores e leituras de jogos no canal oficial.",
    "",
    `🔗 Canal: ${links.youtube}`,
    analise ? `📰 Análise escrita: ${url}` : `🌐 Portal: ${links.site}`,
    "",
    tags,
  ].join("\n");

  const telegram = [
    "▶️ *YouTube* · BarbosaTips",
    "",
    analise ? `Relacionado: *${titulo}*` : "Subscreve o canal @CBarbosaTips",
    "",
    `[YouTube](${links.youtube})`,
    analise ? `[Análise](${url})` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const twitter = [
    "▶️ YouTube @CBarbosaTips",
    links.youtube,
    tags.split(" ").slice(0, 3).join(" "),
  ].join("\n");

  return bundle(
    "analise-cta-youtube",
    "CTA YouTube",
    "red",
    { title: "YOUTUBE", subtitle: titulo.slice(0, 50), badge: "CTA" },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

function buildHashtagsYoutube(): string {
  return ["#BarbosaTips", "#YouTube", "#Tips", "#ApostasEsportivas"].join(" ");
}
