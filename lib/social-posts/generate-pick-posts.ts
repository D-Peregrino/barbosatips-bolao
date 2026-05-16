import { rotuloEsporte } from "@/lib/picks/rotulo-esporte";
import type { PerformancePeriodStats } from "@/lib/picks/performance-periods";
import type { QuickPickRow } from "@/lib/picks/types";
import {
  buildHashtags,
  hashtagsEsporte,
} from "@/lib/social-posts/hashtags";
import { formatHorarioBr, formatOdd, formatPct, truncateTwitter } from "@/lib/social-posts/format";
import type { SocialLinks, SocialPostBundle } from "@/lib/social-posts/types";

function pickUrl(links: SocialLinks, pick: QuickPickRow): string {
  return `${links.site}/pick/${pick.id}`;
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

export function generatePickGreenPost(
  pick: QuickPickRow,
  links: SocialLinks,
): SocialPostBundle {
  const esporte = rotuloEsporte(pick.esporte);
  const tags = hashtagsEsporte(pick.esporte);
  const url = pickUrl(links, pick);
  const jogo = pick.jogo;
  const mercado = pick.mercado;
  const odd = formatOdd(pick.odd);

  const instagram = [
    "✅ GREEN no BarbosaTips",
    "",
    `⚽ ${jogo}`,
    `📊 ${mercado}`,
    `💰 Odd ${odd}`,
    esporte ? `🏷 ${esporte}` : "",
    "",
    "Stake plano 1u · resultado transparente no portal.",
    "",
    `🔗 Picks: ${links.picks}`,
    `📈 Performance: ${links.performance}`,
    "",
    tags,
  ]
    .filter(Boolean)
    .join("\n");

  const telegram = [
    "✅ *GREEN* · BarbosaTips",
    "",
    `*${jogo}*`,
    `${mercado} · ${odd}`,
    "",
    `[Ver pick](${url}) · [Todas as picks](${links.picks})`,
    `[Telegram](${links.telegram})`,
  ].join("\n");

  const twitter = [
    `✅ GREEN · ${jogo}`,
    `${mercado} ${odd}`,
    links.picks,
    tags.split(" ").slice(0, 4).join(" "),
  ].join("\n");

  return bundle(
    "pick-green",
    "Card Green",
    "green",
    { title: "GREEN", subtitle: jogo, badge: odd },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

export function generatePickRedPost(
  pick: QuickPickRow,
  links: SocialLinks,
): SocialPostBundle {
  const esporte = rotuloEsporte(pick.esporte);
  const tags = hashtagsEsporte(pick.esporte);
  const jogo = pick.jogo;
  const mercado = pick.mercado;
  const odd = formatOdd(pick.odd);

  const instagram = [
    "❌ RED · transparência total",
    "",
    `⚽ ${jogo}`,
    `📊 ${mercado}`,
    `💰 Odd ${odd}`,
    esporte ? `🏷 ${esporte}` : "",
    "",
    "Registamos greens e reds no mesmo painel público — sem apagar histórico.",
    "",
    `🔗 ${links.performance}`,
    "",
    tags,
  ]
    .filter(Boolean)
    .join("\n");

  const telegram = [
    "❌ *RED* · BarbosaTips",
    "",
    `*${jogo}* · ${mercado} ${odd}`,
    "",
    "Histórico público — próxima oportunidade no canal.",
    "",
    `[Picks](${links.picks}) · [Performance](${links.performance})`,
  ].join("\n");

  const twitter = [
    `❌ RED · ${jogo}`,
    `${mercado} ${odd}`,
    `Métricas: ${links.performance}`,
    tags.split(" ").slice(0, 3).join(" "),
  ].join("\n");

  return bundle(
    "pick-red",
    "Card Red",
    "red",
    { title: "RED", subtitle: jogo, badge: odd },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

export function generatePickNovaPost(
  pick: QuickPickRow,
  links: SocialLinks,
): SocialPostBundle {
  const esporte = rotuloEsporte(pick.esporte);
  const tags = buildHashtags([esporte, pick.esporte, "NovaPick", "Odds"]);
  const url = pickUrl(links, pick);
  const quando = formatHorarioBr(pick.horario_jogo);
  const odd = formatOdd(pick.odd);

  const instagram = [
    "🆕 NOVA PICK · BarbosaTips",
    "",
    `⚽ ${pick.jogo}`,
    pick.campeonato?.trim() ? `🏆 ${pick.campeonato}` : "",
    `📊 ${pick.mercado}`,
    `💰 ${odd} · confiança ${pick.confianca}%`,
    esporte ? `🏷 ${esporte}` : "",
    quando ? `🕐 ${quando}` : "",
    "",
    pick.justificativa?.trim()
      ? `💡 ${pick.justificativa.slice(0, 220)}${pick.justificativa.length > 220 ? "…" : ""}`
      : "",
    "",
    `🔗 ${url}`,
    `📲 Telegram: ${links.telegram}`,
    "",
    tags,
  ]
    .filter(Boolean)
    .join("\n");

  const telegram = [
    "🆕 *NOVA PICK*",
    "",
    `*${pick.jogo}*`,
    `${pick.mercado} · ${odd} · ${pick.confianca}% conf.`,
    quando ? `🕐 ${quando}` : "",
    "",
    `[Abrir pick](${url})`,
    `[Canal](${links.telegram})`,
  ]
    .filter(Boolean)
    .join("\n");

  const twitter = [
    `🆕 Pick · ${pick.jogo}`,
    `${pick.mercado} ${odd}`,
    url,
    tags.split(" ").slice(0, 4).join(" "),
  ].join("\n");

  return bundle(
    "pick-nova",
    "Card nova pick",
    "amber",
    { title: "NOVA PICK", subtitle: pick.jogo, badge: odd },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

export function generatePickStreakPost(
  stats: PerformancePeriodStats,
  links: SocialLinks,
): SocialPostBundle {
  const tags = buildHashtags(["Streak", "Green", "BarbosaTips", "Performance"]);
  const streak =
    stats.streakAtualTipo === "green" && stats.streakAtual > 0
      ? `${stats.streakAtual} green${stats.streakAtual > 1 ? "s" : ""} seguidos`
      : stats.streakAtualTipo === "red" && stats.streakAtual < 0
        ? `${Math.abs(stats.streakAtual)} red seguidos`
        : "Sem sequência activa";
  const recorde = stats.streakMaximaGreen;

  const instagram = [
    "🔥 STREAK · BarbosaTips",
    "",
    `📅 Período: ${stats.label}`,
    `⚡ Sequência actual: ${streak}`,
    `🏆 Recorde greens: ${recorde} seguidos`,
    `📊 Winrate: ${formatPct(stats.winratePct)} · ROI: ${formatPct(stats.roiPct)}`,
    "",
    `🔗 ${links.performance}`,
    `📲 ${links.telegram}`,
    "",
    tags,
  ].join("\n");

  const telegram = [
    "🔥 *STREAK* · BarbosaTips",
    "",
    `Período: *${stats.label}*`,
    `Actual: *${streak}*`,
    `Recorde green: *${recorde}*`,
    "",
    `[Performance](${links.performance})`,
  ].join("\n");

  const twitter = [
    `🔥 Streak ${stats.label}: ${streak}`,
    `Recorde ${recorde}G · ROI ${formatPct(stats.roiPct)}`,
    links.performance,
    tags.split(" ").slice(0, 3).join(" "),
  ].join("\n");

  return bundle(
    "pick-streak",
    "Card streak",
    "gold",
    { title: "STREAK", subtitle: streak, badge: stats.label },
    instagram,
    telegram,
    twitter,
    tags,
  );
}

export function generatePickPerformancePost(
  stats: PerformancePeriodStats,
  links: SocialLinks,
): SocialPostBundle {
  const tags = buildHashtags(["Performance", "ROI", "Winrate", "BarbosaTips"]);
  const roi = formatPct(stats.roiPct);
  const wr = formatPct(stats.winratePct);

  const instagram = [
    "📈 PERFORMANCE PÚBLICA",
    "",
    `📅 ${stats.label}`,
    `✅ ${stats.greens}G · ❌ ${stats.reds}R · ⬜ ${stats.voids}V`,
    `🎯 Winrate: ${wr}`,
    `💰 ROI (1u): ${roi}`,
    `📦 ${stats.totalResolvidas} picks resolvidas`,
    "",
    "Métricas actualizadas no portal — stake plano 1u.",
    "",
    `🔗 ${links.performance}`,
    `📲 ${links.telegram}`,
    "",
    tags,
  ].join("\n");

  const telegram = [
    "📈 *PERFORMANCE* · BarbosaTips",
    "",
    `*${stats.label}*`,
    `${stats.greens}G / ${stats.reds}R / ${stats.voids}V`,
    `Winrate *${wr}* · ROI *${roi}*`,
    "",
    `[Ver painel](${links.performance})`,
  ].join("\n");

  const twitter = [
    `📈 Performance ${stats.label}`,
    `${stats.greens}G ${stats.reds}R · WR ${wr} · ROI ${roi}`,
    links.performance,
    tags.split(" ").slice(0, 3).join(" "),
  ].join("\n");

  return bundle(
    "pick-performance",
    "Card performance",
    "violet",
    { title: "PERFORMANCE", subtitle: stats.label, badge: roi },
    instagram,
    telegram,
    twitter,
    tags,
  );
}
