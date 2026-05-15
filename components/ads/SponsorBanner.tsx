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
  "relative w-full min-w-0 overflow-hidden rounded-2xl border border-gold-400/18 bg-gradient-to-br from-pitch-900/90 via-[#0a0906] to-[var(--color-void)] shadow-[inset_0_1px_0_rgba(232,207,122,0.06)] transition duration-300 hover:border-gold-400/28 hover:shadow-[0_12px_40px_-24px_rgba(201,162,39,0.12)]";

/**
 * Palco da imagem — largura 100%, proporção do slot + altura mínima.
 * Proporções alinhadas aos criativos em public/patrocinadores para object-contain preencher o palco.
 */
function mediaStageClass(position: SponsorBannerPosition): string {
  const base =
    "relative box-border w-full min-w-0 max-w-none overflow-hidden rounded-xl bg-black/20";

  switch (position) {
    case "horizontal":
      /* home-horizontal.jpg */
      return cn(base, "aspect-[1024/380] min-h-[5rem] w-full sm:min-h-[6.25rem]");
    case "mobile":
      /* mobile-strip.jpg */
      return cn(base, "aspect-[2/1] min-h-[4.5rem] w-full sm:min-h-[5.75rem]");
    case "sidebar":
      /* sidebar-desktop.jpg — vertical 300×600 */
      return cn(base, "aspect-[300/600] w-full");
    case "between-content":
      return cn(base, "aspect-[1024/380] min-h-[4.5rem] w-full sm:min-h-[5.5rem]");
    default:
      return cn(base, "aspect-[1200/250] min-h-[5rem] w-full");
  }
}

function positionFrame(position: SponsorBannerPosition): string {
  switch (position) {
    case "horizontal":
      return cn(frameBase, "px-2 py-2 sm:px-3 sm:py-3");
    case "sidebar":
      return cn(frameBase, "px-1.5 py-2 sm:px-2 sm:py-2.5");
    case "mobile":
      return cn(frameBase, "px-2 py-2");
    case "between-content":
      return cn(frameBase, "px-2 py-2 sm:px-3 sm:py-2.5");
    default:
      return cn(frameBase, "p-2");
  }
}

/** Preenche 100% do palco; sem max-width nem altura fixa pequena. */
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
    <div className="flex w-full min-w-0 max-w-none flex-col">
      <p className={labelClass}>PATROCINADOR</p>
      {mediaStage}
    </div>
  );

  const interactiveClass =
    "block w-full min-w-0 max-w-none outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950";

  return (
    <div className={cn(positionFrame(position), className)} role="complementary" aria-label={alt}>
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

