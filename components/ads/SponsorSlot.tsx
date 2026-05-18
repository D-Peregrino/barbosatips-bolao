import { sponsorBannerSlots, type SponsorSlotKey } from "@/config/sponsor-banners";
import { SponsorBanner } from "@/components/ads/SponsorBanner";
import { buscarBannerAtivoPorPosicao } from "@/lib/banners/queries";
import type { BannerPosition, BannerPublicitario } from "@/lib/banners/types";

type Props = {
  slot: SponsorSlotKey;
  className?: string;
};

const dynamicPositionBySlot: Record<SponsorSlotKey, BannerPosition> = {
  sidebarDesktop: "sidebar_left",
  homeHorizontal: "home_horizontal",
  mobileStrip: "mobile_banner",
  feedBetween: "home_horizontal",
};

const visualPositionByBannerPosition = {
  sidebar_left: "sidebar",
  sidebar_right: "sidebar",
  home_horizontal: "horizontal",
  mobile_banner: "mobile",
} as const;

function trackedBannerHref(banner: BannerPublicitario): string {
  return `/api/banner-click/${encodeURIComponent(banner.id)}`;
}

export async function AffiliateBannerSlot({
  position,
  className,
}: {
  position: BannerPosition;
  className?: string;
}) {
  const banner = await buscarBannerAtivoPorPosicao(position);
  if (!banner) return null;

  return (
    <SponsorBanner
      imageUrl={banner.imagem_url}
      link={trackedBannerHref(banner)}
      alt={banner.titulo}
      position={visualPositionByBannerPosition[position]}
      className={className}
      newTab
    />
  );
}

/**
 * Renderiza um banner de patrocinador conforme `config/sponsor-banners.ts`.
 * Desactiva com `enabled: false` no slot correspondente.
 */
async function SponsorSlot({ slot, className }: Props) {
  const dynamic = await buscarBannerAtivoPorPosicao(dynamicPositionBySlot[slot]);
  if (dynamic) {
    return (
      <SponsorBanner
        imageUrl={dynamic.imagem_url}
        link={trackedBannerHref(dynamic)}
        alt={dynamic.titulo}
        position={visualPositionByBannerPosition[dynamic.posicao]}
        className={className}
        newTab
      />
    );
  }

  const cfg = sponsorBannerSlots[slot];
  if (!cfg?.enabled) return null;

  return (
    <SponsorBanner
      imageFile={cfg.imageFile}
      link={cfg.href}
      alt={cfg.alt}
      position={cfg.position}
      className={className}
    />
  );
}

export default SponsorSlot;
export { SponsorSlot };
