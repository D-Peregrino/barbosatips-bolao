import { BrandShield } from "@/components/brand/BrandShield";

/**
 * Shell de carregamento entre rotas — reduz sensação de “salto” e CLS com altura mínima estável.
 */
export default function Loading() {
  return (
    <div
      className="commercial-page-bg flex min-h-[min(70vh,560px)] flex-col items-center justify-center px-6 py-16"
      aria-busy="true"
      aria-label="A carregar"
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 scale-150 rounded-full bg-gold-400/10 blur-3xl"
          aria-hidden
        />
        <BrandShield size="lg" glow="medium" className="relative animate-brand-breathe" />
      </div>

      <div className="mt-12 w-full max-w-md space-y-3" aria-hidden>
        <div className="h-3 w-3/4 max-w-sm animate-pulse rounded-full bg-zinc-800/90" />
        <div className="h-3 w-full animate-pulse rounded-full bg-zinc-800/70" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-zinc-800/60" />
      </div>

      <p className="mt-8 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400/80">
        BarbosaTips
      </p>
    </div>
  );
}
