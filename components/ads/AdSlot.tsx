import { cn } from "@/lib/utils";

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

  const baseFrame =
    "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/70 via-pitch-900/80 to-black text-center shadow-[inset_0_1px_0_rgba(251,191,36,.08)]";

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
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90">
          {primary}
        </span>
        <span className="max-w-[7rem] text-[9px] leading-snug text-zinc-500">{secondary}</span>
        <div
          className="mt-2 h-24 w-px bg-gradient-to-b from-transparent via-amber-500/25 to-transparent"
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
        <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
          Patrocínio
        </span>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <span className="text-xs font-semibold text-zinc-200">{primary}</span>
          <span className="text-[11px] text-zinc-500">{secondary}</span>
        </div>
        <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
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
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
          Destaque
        </span>
        <p className="font-display text-lg font-bold text-white">{primary}</p>
        <p className="text-xs text-zinc-500">{secondary}</p>
      </div>
    );
  }

  /* mobile-inline */
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
      <span className="text-left text-[11px] font-semibold leading-tight text-zinc-300">
        {primary}
      </span>
      <span className="shrink-0 rounded-md border border-zinc-600/80 bg-black/40 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-zinc-500">
        {secondary}
      </span>
    </div>
  );
}
