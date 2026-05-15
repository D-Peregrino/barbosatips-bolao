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
  "mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-stone-500/90";

const frameBase =
  "relative overflow-hidden rounded-2xl border border-gold-400/18 bg-gradient-to-br from-pitch-900/90 via-[#0a0906] to-[var(--color-void)] shadow-[inset_0_1px_0_rgba(232,207,122,0.06)] transition duration-300 hover:border-gold-400/28 hover:shadow-[0_12px_40px_-24px_rgba(201,162,39,0.12)]";

function positionFrame(position: SponsorBannerPosition): string {
  switch (position) {
    case "horizontal":
      return cn(frameBase, "w-full px-4 py-4 sm:px-6 sm:py-5");
    case "sidebar":
      return cn(frameBase, "w-full px-2.5 py-4 lg:min-h-[200px]");
    case "mobile":
      return cn(frameBase, "w-full px-3 py-3");
    case "between-content":
      return cn(frameBase, "w-full px-4 py-3.5 sm:px-5");
    default:
      return frameBase;
  }
}

function imgClass(position: SponsorBannerPosition): string {
  switch (position) {
    case "horizontal":
      return "mx-auto block h-auto max-h-[72px] w-auto max-w-full object-contain sm:max-h-[84px]";
    case "sidebar":
      return "mx-auto block h-auto max-h-[320px] w-full max-w-[140px] object-contain object-center xl:max-w-[152px]";
    case "mobile":
      return "mx-auto block h-auto max-h-[52px] w-auto max-w-full object-contain sm:max-h-[56px]";
    case "between-content":
      return "mx-auto block h-auto max-h-[64px] w-auto max-w-full object-contain sm:max-h-[76px]";
    default:
      return "mx-auto h-auto max-w-full object-contain";
  }
}

/**
 * Banner de patrocinador — imagem local em `public/patrocinadores`, estética premium.
 */
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

  const inner = (
    <>
      <p className={labelClass}>PATROCINADOR</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- criativos arbitrários em /public */}
      <img src={src} alt={alt} className={imgClass(position)} loading="lazy" decoding="async" />
    </>
  );

  const interactiveClass =
    "block outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950";

  return (
    <div className={cn(positionFrame(position), className)} role="complementary" aria-label={alt}>
      {!navigable ? (
        <div className={interactiveClass}>{inner}</div>
      ) : isExternal ? (
        <a href={link.trim()} target="_blank" rel="noopener noreferrer sponsored" className={interactiveClass}>
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
