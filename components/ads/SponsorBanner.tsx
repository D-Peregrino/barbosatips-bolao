import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SponsorBannerPosition } from "@/config/sponsor-banners";

export type SponsorBannerProps = {
  /** Nome do ficheiro em `public/patrocinadores/` (ex.: `home-horizontal.jpg`) */
  imageFile: string;
  link: string;
  alt: string;
  position: SponsorBannerPosition;
  className?: string;
};

const labelClass =
  "mb-2 shrink-0 text-[9px] font-bold uppercase tracking-[0.22em] text-stone-500/90";

const frameBase =
  "relative min-w-0 overflow-hidden rounded-2xl border border-gold-400/18 bg-gradient-to-br from-pitch-900/90 via-[#0a0906] to-[var(--color-void)] shadow-[inset_0_1px_0_rgba(232,207,122,0.06)] transition duration-300 hover:border-gold-400/28 hover:shadow-[0_12px_40px_-24px_rgba(201,162,39,0.12)]";

/** Faixa horizontal desktop — largura fluida com tetos (zoom / resolução). */
const desktopStripShell = "mx-auto w-full max-w-[min(100%,1000px)]";
const desktopStripMedia = cn(
  "relative box-border w-full overflow-hidden rounded-xl bg-black/20",
  "aspect-[1024/380] max-h-[6.25rem] sm:max-h-[7rem] md:max-h-[8rem] lg:max-h-[8.75rem]",
);

/** Moldura exterior — largura e alinhamento por slot. */
function shellClass(position: SponsorBannerPosition): string {
  switch (position) {
    case "horizontal":
    case "between-content":
      return desktopStripShell;
    case "sidebar":
      return "mx-auto w-full max-w-[220px] lg:max-w-[240px] xl:max-w-[260px]";
    case "mobile":
      return "w-full";
    default:
      return desktopStripShell;
  }
}

/** Palco da imagem — altura/largura contidas, arte com object-contain. */
function mediaStageClass(position: SponsorBannerPosition): string {
  const base = "relative box-border w-full overflow-hidden rounded-xl bg-black/20";

  switch (position) {
    case "horizontal":
    case "between-content":
      return desktopStripMedia;
    case "mobile":
      return cn(base, "aspect-[2/1] w-full max-h-[4.5rem] sm:max-h-[5rem]");
    case "sidebar":
      return cn(base, "aspect-[300/600] w-full");
    default:
      return desktopStripMedia;
  }
}

function positionFrame(position: SponsorBannerPosition): string {
  switch (position) {
    case "horizontal":
    case "between-content":
      return cn(frameBase, "px-2 py-1.5 sm:px-2.5 sm:py-2");
    case "sidebar":
      return cn(frameBase, "px-1.5 py-2");
    case "mobile":
      return cn(frameBase, "px-2 py-2");
    default:
      return cn(frameBase, "px-2 py-1.5 sm:px-2.5 sm:py-2");
  }
}

const imgFillClass =
  "absolute inset-0 block h-full w-full max-h-none max-w-none object-contain object-center";

function isNavigableHref(link: string): boolean {
  const t = link.trim();
  if (!t) return false;
  return /^https?:\/\//i.test(t) || t.startsWith("/") || t.startsWith("#") || t.startsWith("?");
}

export function SponsorBanner({ imageFile, link, alt, position, className }: SponsorBannerProps) {
  const navigable = isNavigableHref(link);
  const isExternal = /^https?:\/\//i.test(link.trim());
  const safe = imageFile.replace(/^\/+/, "").replace(/\.\./g, "");
  const src = `/patrocinadores/${safe}`;

  const mediaStage = (
    <div className={mediaStageClass(position)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- criativos em /public */}
      <img src={src} alt={alt} className={imgFillClass} loading="lazy" decoding="async" />
    </div>
  );

  const inner = (
    <div className="flex w-full min-w-0 flex-col">
      <p className={labelClass}>PATROCINADOR</p>
      {mediaStage}
    </div>
  );

  const interactiveClass =
    "block w-full min-w-0 outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950";

  return (
    <div
      className={cn(shellClass(position), positionFrame(position), className)}
      role="complementary"
      aria-label={alt}
    >
      {!navigable ? (
        <div className={interactiveClass}>{inner}</div>
      ) : isExternal ? (
        <a
          href={link.trim()}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={interactiveClass}
        >
          {inner}
        </a>
      ) : (
        <Link href={link.trim()} className={interactiveClass}>
          {inner}
        </Link>
      )}
    </div>
  );
}
