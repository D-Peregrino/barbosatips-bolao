import { sponsorBannerSlots, type SponsorSlotKey } from "@/config/sponsor-banners";
import { SponsorBanner } from "@/components/ads/SponsorBanner";

type Props = {
  slot: SponsorSlotKey;
  className?: string;
};

/**
 * Renderiza um banner de patrocinador conforme `config/sponsor-banners.ts`.
 * Desactiva com `enabled: false` no slot correspondente.
 */
function SponsorSlot({ slot, className }: Props) {
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
