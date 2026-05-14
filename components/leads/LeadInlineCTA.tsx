import Link from "next/link";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeadInlineCTAProps = {
  /** Contexto para microcopy */
  context: "analises" | "picks";
  className?: string;
};

/**
 * CTA editorial entre listagens — leva à página de newsletter (sem popup agressivo).
 */
export function LeadInlineCTA({ context, className }: LeadInlineCTAProps) {
  const isPicks = context === "picks";
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold-400/20 bg-gradient-to-br from-zinc-900/80 via-black/90 to-zinc-950/90 p-6 sm:p-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-400/95">
            <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Lista inteligente
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
            {isPicks
              ? "Recebe picks e greens no teu ritmo"
              : "Análises e alertas sem perder o fio"}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Escolhe o desporto e o tipo de conteúdo — email discreto, segmentado (futebol, NBA, ténis…).
            Também estamos no Telegram e WhatsApp.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href="/newsletter#cadastro"
            className="inline-flex min-h-[44px] min-w-[180px] items-center justify-center rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 px-6 text-sm font-bold text-pitch-950 shadow-md transition hover:brightness-110"
          >
            Inscrever-me
          </Link>
          <Link
            href="/comunidade"
            className="text-center text-xs font-semibold text-gold-300/90 underline-offset-2 hover:underline sm:text-right"
          >
            Comunidade →
          </Link>
        </div>
      </div>
    </aside>
  );
}
