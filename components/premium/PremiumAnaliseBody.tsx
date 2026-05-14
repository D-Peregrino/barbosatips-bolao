import Link from "next/link";
import { PremiumLockBadge } from "@/components/premium/PremiumLockBadge";
import { siteConfig } from "@/config/site";

type Props = {
  corpoHtml: string;
  resumo: string;
  unlocked: boolean;
};

/**
 * Corpo da análise: texto completo ou pré-visualização + blur + CTA (não assinante / anónimo).
 */
export function PremiumAnaliseBody({ corpoHtml, resumo, unlocked }: Props) {
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

  return (
    <div className="space-y-6">
      {resumo?.trim() ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90">
            Pré-visualização
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{resumo.trim()}</p>
        </div>
      ) : null}

      {corpoHtml ? (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-[#080706]/80">
          <div
            className="analise-conteudo-html pointer-events-none max-h-[420px] select-none blur-md"
            aria-hidden
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: corpoHtml }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/85" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 text-center">
            <PremiumLockBadge className="pointer-events-auto scale-110" />
            <p className="pointer-events-auto max-w-sm text-sm text-zinc-300">
              Conteúdo exclusivo BarbosaTips{" "}
              <span className="font-semibold text-amber-200">Premium</span>. Assine ou entre no VIP
              para ler na íntegra.
            </p>
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/premium"
                className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-amber-900/30 transition hover:brightness-110"
              >
                Ver planos Premium
              </Link>
              <a
                href={siteConfig.social.telegram}
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
