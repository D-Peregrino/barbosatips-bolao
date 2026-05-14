import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Faixa global beta — sensação de produto vivo sem depender de estado cliente.
 */
export function BetaLaunchRibbon() {
  return (
    <div
      className="border-b border-gold-400/15 bg-gradient-to-r from-[#151008] via-[#0d0c09] to-[#151008]"
      role="status"
      aria-label="Versão beta pública"
    >
      <div className="container-site flex flex-col gap-2.5 py-2.5 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-stone-200">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/35 bg-gold-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-gold-100">
            <Sparkles className="h-3 w-3 text-gold-200" aria-hidden />
            Beta público
          </span>
          <span className="min-w-0 text-[12px] leading-snug text-stone-300 sm:text-[13px]">
            Portal em expansão — novas ligas, picks e conteúdo editorial chegam em cadência semanal.
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href="/picks"
            className="rounded-lg border border-gold-400/30 bg-gold-400/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gold-100 transition hover:border-gold-300/50"
          >
            Ver picks
          </Link>
          <Link
            href="/comunidade"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-stone-200 transition hover:border-white/20 hover:text-white"
          >
            Comunidade →
          </Link>
        </div>
      </div>
    </div>
  );
}
