import Link from "next/link";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { VipBadge } from "@/components/premium/VipBadge";
import type { ContentTier } from "@/lib/premium/content-tier";
import { siteConfig } from "@/config/site";
import { betaPremiumHref, betaVipHref } from "@/lib/beta/cta-hrefs";

type Props = {
  corpoHtml: string;
  resumo: string;
  unlocked: boolean;
  /** Camada editorial (VIP = exclusivo dentro do ecossistema premium). */
  contentTier: ContentTier;
};

/**
 * Corpo da análise: integral, ou pré-visualização gratuita + conteúdo bloqueado parcial (blur).
 */
export function PremiumAnaliseBody({
  corpoHtml,
  resumo,
  unlocked,
  contentTier,
}: Props) {
  if (unlocked) {
    if (!corpoHtml) {
      return <p className="text-zinc-500">Conteúdo em elaboração.</p>;
    }
    return (
      <div
        className="analise-conteudo-html"
        // eslint-disable-next-line react/no-danger -- HTML sanitizado
        dangerouslySetInnerHTML={{ __html: corpoHtml }}
      />
    );
  }

  const isExclusive = contentTier === "exclusive";
  const previewTitle = isExclusive ? "Pré-visualização VIP" : "Pré-visualização gratuita";

  return (
    <div className="space-y-6">
      {isExclusive ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gold-400/30 bg-gradient-to-r from-[#141008]/95 to-black/80 px-3 py-2">
          <VipBadge />
          <span className="text-[11px] text-zinc-400">
            Conteúdo na camada <span className="font-semibold text-gold-200">exclusiva</span> — o acesso
            continua ligado à tua assinatura premium quando activa.
          </span>
        </div>
      ) : null}

      {resumo?.trim() ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90">
            {previewTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{resumo.trim()}</p>
        </div>
      ) : null}

      {corpoHtml ? (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-[#080706]/80">
          <div
            className={cnBlurPreview(isExclusive)}
            aria-hidden
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: corpoHtml }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/85" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 text-center">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              {isExclusive ? <VipBadge className="scale-110" /> : null}
              <PremiumLockBadge
                className={isExclusive ? "pointer-events-auto scale-105" : "pointer-events-auto scale-110"}
              />
            </div>
            <p className="pointer-events-auto max-w-sm text-sm text-zinc-300">
              {isExclusive ? (
                <>
                  Leitura integral reservada ao <span className="font-semibold text-gold-200">VIP</span>{" "}
                  BarbosaTips — mesmo acesso premium, com fila editorial mais restrita.
                </>
              ) : (
                <>
                  Conteúdo <span className="font-semibold text-amber-200">Premium</span> BarbosaTips.
                  Assina ou entra no canal VIP para ler na íntegra.
                </>
              )}
            </p>
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              <Link
                href={betaVipHref()}
                className="rounded-xl border border-gold-400/45 bg-gold-400/[0.12] px-5 py-2.5 text-sm font-bold text-gold-100 shadow-md transition hover:bg-gold-400/18"
              >
                Programa VIP
              </Link>
              <Link
                href={betaPremiumHref()}
                className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-amber-900/30 transition hover:brightness-110"
              >
                Premium
              </Link>
              <a
                href={siteConfig.hub.telegramCanal}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-amber-500/50 bg-black/60 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-950/50"
              >
                Telegram VIP
              </a>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500">Conteúdo em elaboração.</p>
      )}
    </div>
  );
}

function cnBlurPreview(isExclusive: boolean): string {
  const base =
    "analise-conteudo-html pointer-events-none max-h-[420px] select-none blur-md";
  if (isExclusive) return `${base} max-h-[340px] blur-lg opacity-90`;
  return base;
}
