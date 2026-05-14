import { cn } from "@/lib/utils";
import { BrandShield } from "@/components/brand/BrandShield";

export type AdSlotVariant =
  | "sidebar"
  | "banner-horizontal"
  | "card-patrocinado"
  | "mobile-inline";

export type AdSlotIntent = "sponsor" | "ads";

export type AdSlotProps = {
  variant: AdSlotVariant;
  /** Texto do placeholder: patrocinador vs bloco genérico Google Ads. */
  intent?: AdSlotIntent;
  className?: string;
  /** Reservado para futura integração AdSense (não usado em modo placeholder). */
  slot?: string;
};

const copy = {
  sponsor: "Espaço para patrocinador",
  ads: "Google Ads",
} as const;

const baseFrame =
  "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-gold-400/22 bg-gradient-to-br from-pitch-900/95 via-pitch-950 to-[var(--color-void)] text-center shadow-[inset_0_1px_0_rgba(232,207,122,0.08)]";

function Watermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]" aria-hidden>
      <BrandShield size="xl" decorative />
    </div>
  );
}

/**
 * Espaços reservados para patrocinadores e Google Ads — sem script AdSense.
 * Variantes alinham ao layout comercial (rails desktop / banners mobile).
 */
export function AdSlot({
  variant,
  intent = "ads",
  className,
}: AdSlotProps) {
  const primary = copy[intent];
  const secondary = intent === "sponsor" ? copy.ads : copy.sponsor;

  if (variant === "sidebar") {
    return (
      <aside
        className={cn(
          baseFrame,
          "min-h-[280px] w-full px-3 py-6 lg:min-h-[360px] xl:min-h-[420px]",
          className,
        )}
        aria-label={primary}
      >
        <Watermark />
        <BrandShield size="md" className="relative z-[1] opacity-40" decorative />
        <span className="relative z-[1] text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/95">
          {primary}
        </span>
        <span className="relative z-[1] max-w-[7rem] text-[9px] leading-snug text-stone-400">
          {secondary}
        </span>
        <div
          className="relative z-[1] mt-2 h-24 w-px bg-gradient-to-b from-transparent via-gold-400/25 to-transparent"
          aria-hidden
        />
      </aside>
    );
  }

  if (variant === "banner-horizontal") {
    return (
      <div
        className={cn(
          baseFrame,
          "min-h-[88px] w-full flex-row gap-6 px-4 py-4 sm:min-h-[100px] sm:px-8",
          className,
        )}
        role="region"
        aria-label={`${primary} · ${secondary}`}
      >
        <Watermark />
        <span className="relative z-[1] rounded-full border border-emerald-400/40 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
          Patrocínio
        </span>
        <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-1">
          <BrandShield size="sm" className="opacity-55" decorative />
          <span className="text-xs font-semibold text-stone-200">{primary}</span>
          <span className="text-[11px] text-stone-400">{secondary}</span>
        </div>
        <span className="relative z-[1] rounded-full border border-gold-400/35 bg-gold-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-100">
          Ads
        </span>
      </div>
    );
  }

  if (variant === "card-patrocinado") {
    return (
      <div
        className={cn(
          baseFrame,
          "min-h-[140px] w-full max-w-sm px-5 py-6 sm:min-h-[160px]",
          className,
        )}
        role="region"
        aria-label={primary}
      >
        <Watermark />
        <span className="relative z-[1] text-[10px] font-black uppercase tracking-[0.18em] text-gold-400">
          Destaque
        </span>
        <BrandShield size="md" className="relative z-[1] opacity-45" decorative />
        <p className="relative z-[1] font-display text-lg font-bold text-cream">{primary}</p>
        <p className="relative z-[1] text-xs text-stone-500">{secondary}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseFrame,
        "min-h-[72px] w-full flex-row justify-between gap-3 px-4 py-3 sm:px-5",
        className,
      )}
      role="region"
      aria-label={`${primary} · ${secondary}`}
    >
      <Watermark />
      <span className="relative z-[1] flex items-center gap-2 text-left text-[11px] font-semibold leading-tight text-stone-200">
        <BrandShield size="xs" className="opacity-50" decorative />
        {primary}
      </span>
      <span className="relative z-[1] shrink-0 rounded-md border border-gold-400/15 bg-black/50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-stone-500">
        {secondary}
      </span>
    </div>
  );
}
