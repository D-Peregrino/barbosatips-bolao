import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_OFICIAL_PNG } from "@/lib/brand/assets";

const DIM = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 80,
  xl: 128,
  hero: 200,
} as const;

export type BrandShieldSize = keyof typeof DIM;

export type BrandShieldProps = {
  size?: BrandShieldSize;
  className?: string;
  /** Para LCP no hero. */
  priority?: boolean;
  /** Brilho dourado suave (evitar `medium` em listas densas). */
  glow?: "none" | "soft" | "medium";
  /** Texto alternativo; em decoração use `decorative`. */
  alt?: string;
  decorative?: boolean;
};

export function BrandShield({
  size = "md",
  className,
  priority,
  glow = "none",
  alt = "BarbosaTips",
  decorative,
}: BrandShieldProps) {
  const dim = DIM[size];
  const glowClass =
    glow === "soft"
      ? "drop-shadow-[0_0_20px_rgba(201,162,39,0.22)]"
      : glow === "medium"
        ? "drop-shadow-[0_0_36px_rgba(201,162,39,0.28)]"
        : "";

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", glowClass, className)}
      style={{ width: dim, height: dim }}
    >
      <Image
        src={BRAND_LOGO_OFICIAL_PNG}
        alt={decorative ? "" : alt}
        role={decorative ? "presentation" : undefined}
        fill
        sizes={`${dim}px`}
        className="object-contain object-center"
        quality={92}
        priority={priority}
      />
    </div>
  );
}
