import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdSlot } from "@/components/ads/AdSlot";
import { CommunityHubRail } from "@/components/community/CommunityHubRail";

export type CommercialPageShellProps = {
  children: ReactNode;
  /** Rail esquerdo desktop; omissão = placeholder patrocinador. */
  railLeft?: ReactNode;
  /** Rail direito desktop; omissão = placeholder Google Ads. */
  railRight?: ReactNode;
  className?: string;
  /** Classe na coluna central (ex.: espaçamento extra). */
  mainClassName?: string;
};

/**
 * Largura central para conteúdo + colunas laterais opcionais (desktop) para ads/patrocínio.
 * Em `lg+` mostra rails; o conteúdo principal fica em coluna limitada. Em mobile as rails não aparecem — use `<AdSlot variant="banner-horizontal" />` ou `mobile-inline` entre secções dentro de `children`.
 */
export function CommercialPageShell({
  children,
  railLeft,
  railRight,
  className,
  mainClassName,
}: CommercialPageShellProps) {
  const left = railLeft ?? <AdSlot variant="sidebar" intent="sponsor" />;
  const right =
    railRight ?? (
      <>
        <AdSlot variant="sidebar" intent="ads" />
        <CommunityHubRail />
      </>
    );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="mx-auto w-full max-w-[1540px] px-3 sm:px-5 lg:px-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,132px)_minmax(0,1fr)_minmax(0,132px)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,152px)_minmax(0,1fr)_minmax(0,152px)]">
          <div className="hidden lg:flex lg:sticky lg:top-24 lg:flex-col lg:gap-4">
            {left}
          </div>

          <div
            className={cn(
              "min-w-0 w-full max-w-6xl justify-self-center lg:justify-self-stretch",
              mainClassName,
            )}
          >
            {children}
          </div>

          <div className="hidden lg:flex lg:sticky lg:top-24 lg:flex-col lg:gap-4">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
