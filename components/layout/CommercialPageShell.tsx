import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SponsorSlot from "@/components/ads/SponsorSlot";
import { CommunityHubRail } from "@/components/community/CommunityHubRail";
import { sponsorBannerSlots } from "@/config/sponsor-banners";

export type CommercialPageShellProps = {
  children: ReactNode;
  /** Rail esquerdo desktop; omissão = patrocinador real (`sidebarDesktop`) se activo. */
  railLeft?: ReactNode;
  /** Rail direito desktop; omissão = comunidade (Telegram / YouTube). */
  railRight?: ReactNode;
  className?: string;
  /** Classe na coluna central (ex.: espaçamento extra). */
  mainClassName?: string;
};

/**
 * Largura central + colunas laterais em `lg+`. Patrocinador só com imagem em `/patrocinadores`.
 */
export function CommercialPageShell({
  children,
  railLeft,
  railRight,
  className,
  mainClassName,
}: CommercialPageShellProps) {
  const defaultLeft = sponsorBannerSlots.sidebarDesktop.enabled ? (
    <SponsorSlot slot="sidebarDesktop" />
  ) : null;
  const left = railLeft ?? defaultLeft;
  const hasLeftColumn = left != null;
  const right = railRight ?? <CommunityHubRail />;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="mx-auto w-full max-w-[1540px] px-3 sm:px-5 lg:px-6">
        <div
          className={cn(
            "grid gap-4 sm:gap-6 lg:items-start lg:gap-8",
            hasLeftColumn
              ? "lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,140px)] xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,160px)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,140px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,160px)]",
          )}
        >
          {hasLeftColumn ? (
            <div className="hidden lg:flex lg:sticky lg:top-24 lg:flex-col lg:gap-4">{left}</div>
          ) : null}

          <div
            className={cn(
              "min-w-0 w-full max-w-6xl justify-self-center lg:justify-self-stretch",
              mainClassName,
            )}
          >
            {children}
          </div>

          <div className="hidden lg:flex lg:sticky lg:top-24 lg:flex-col lg:gap-4">{right}</div>
        </div>
      </div>
    </div>
  );
}
