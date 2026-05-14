import { BrandShield } from "@/components/brand/BrandShield";

/**
 * Shell de carregamento entre rotas — altura estável, menos CLS, skeleton premium com brilho suave.
 */
export default function Loading() {
  return (
    <div
      className="commercial-page-bg flex min-h-[min(72vh,580px)] flex-col px-4 py-12 sm:px-6 sm:py-16"
      aria-busy="true"
      aria-label="A carregar"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col items-center">
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 scale-150 rounded-full bg-gold-400/10 blur-3xl"
            aria-hidden
          />
          <BrandShield size="lg" glow="medium" className="relative animate-brand-breathe" />
        </div>

        <p className="mt-8 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400/85">
          BarbosaTips
        </p>

        <div
          className="mt-10 w-full rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/40 to-black/50 p-4 shadow-[0_20px_48px_-36px_rgba(0,0,0,0.85)] backdrop-blur-sm sm:p-5"
          aria-hidden
        >
          <div className="flex items-center gap-3">
            <div className="barbosa-skeleton-line h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="barbosa-skeleton-line h-3 w-[72%]" />
              <div className="barbosa-skeleton-line h-2.5 w-[46%] opacity-80" />
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="barbosa-skeleton-line h-2.5 w-full" />
            <div className="barbosa-skeleton-line h-2.5 w-[92%]" />
            <div className="barbosa-skeleton-line h-2.5 w-[78%]" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="barbosa-skeleton-line h-14 rounded-xl" />
            <div className="barbosa-skeleton-line h-14 rounded-xl opacity-90" />
            <div className="barbosa-skeleton-line h-14 rounded-xl opacity-75" />
          </div>
        </div>
      </div>
    </div>
  );
}
